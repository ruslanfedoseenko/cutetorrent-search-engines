var ThePirateBayProvider = new CustomScriptSearchProvider();
ThePirateBayProvider.InitPlugin = function() {
	this.name = "ThePirateBay";
	this.url = "http://thepiratebay.gd/";
	this.supportedCategories = Enums.All;
	this.responseType = Enums.HTML
	this.requestType = Enums.GET;
    this.category_map = [];
	this.category_map[Enums.All]="0";
	this.category_map[Enums.Anime]="200";
	this.category_map[Enums.Music]="100";
	this.category_map[Enums.TV]="208";
	this.category_map[Enums.Porn]="500";
	this.category_map[Enums.Software]="300";
	this.category_map[Enums.Games]="400";
	this.category_map[Enums.Books]="601";
	this.category_map[Enums.Movie]="200";
    ThePirateBayProvider.HtmlResultReady.connect(ThePirateBayProvider, "OnHtmlResultReady");
}

ThePirateBayProvider.BuildUrl = function(token, category, page) {
   
        return "http://thepiratebay.gd/search/" + token + '/0/7/' + this.category_map[category];
}

ThePirateBayProvider.OnHtmlResultReady = function()
{
	
	if (this.htmlResult !== undefined)
	{
		var table = this.htmlResult.getElementsByName("table","id", "searchResult");
		var tbody = [];
		for (var i = 0; i< table[0].Children.length; i++)
		{
			var currentTableTag = table[0].Children[i];
			print("current Table Tag: " + currentTableTag.Name);
			if (currentTableTag.Name.toUpperCase() == "TR" )
			{
				tbody.push(currentTableTag);
			}
		}
		this.ParseTableBody(tbody);
	}
}

ThePirateBayProvider.ParseTableBody = function(tableBody)
{
	var traverseQueue = [];
	traverseQueue.push.apply(traverseQueue, tableBody);
	var tdCounter = 0;
	var searchResults = [];
	
	while(traverseQueue.length > 0)
	{
		var currentTag = traverseQueue.shift();
		traverseQueue.push.apply(traverseQueue, currentTag.Children);
		var curremtSearchResult;
		if (currentTag.Name.toUpperCase() == "TD")
		{
			switch(tdCounter)
			{
				case 1: 
				{
					var childCount = currentTag.Children.length;
					for(var i = 0; i < childCount; i++)
					{
						var child = currentTag.Children[i];
						print("Current Tag: " + child.Name);
						if (child.Name.toUpperCase() === "DIV")
						{
							var subChild = child.Children[0];
							if (subChild.Name.toUpperCase() === "A")
							{
								var url = subChild.getAttributeValue("href");
								curremtSearchResult = new SearchResult();
								curremtSearchResult.torrentDescUrl = this.url + url;
								curremtSearchResult.name = this.htmlResult.getInnerText(subChild);
							
							}
						}
						else if (child.Name.toUpperCase() === "A")
						{
							var url = child.getAttributeValue("href");
							if (url.indexOf('magnet') == 0)
							{
								print('torrentDownloadUrl: ' + url);
								curremtSearchResult.torrentFileUrl = url;
							}
							
						}
						else if (child.Name.toUpperCase() === "FONT" && child.checkAttribute("class", "detDesc"))
						{
							var describtionText = this.htmlResult.getInnerText(child);
							var sizeIndex = describtionText.indexOf('Size');
							if (sizeIndex > -1)
							{
								sizeIndex += 5;
								endIndex = describtionText.indexOf(',',sizeIndex );
								var sizeStr = describtionText.substr(sizeIndex, endIndex - sizeIndex + 1);
								sizeStr = sizeStr.replace("&nbsp;"," ");
								print("SizeStr: " + sizeStr);
								sizeStrLowerCase = sizeStr.toLowerCase();
								if (sizeStrLowerCase.indexOf(" tib") > -1 ||  sizeStrLowerCase.indexOf(" gib") > -1 || sizeStrLowerCase.indexOf(" mib") > -1 || sizeStrLowerCase.indexOf(" kib") > -1 || sizeStrLowerCase.indexOf(" b") > -1)
								{
									var parts1 = sizeStrLowerCase.split(' ');
									
									var size = parseFloat(parts1[0]);
									var kbPart = parts1[1];
									switch(kbPart[0])
									{
										case 'k':
										{
											size*=1024;
											break;
										}
										case 'm':
										{
											size*=1024*1024;
											break;
										}
										case 'g':
										{
											size*=1024*1024*1024;
											break;
										}
										case 't':
										{
											size*=1024*1024*1024*1024;
											break;
										}
									}
									if (!isNaN(size))
									{
										curremtSearchResult.size = size;
									}
									else
									{
										curremtSearchResult.size = -1;
									}
								}
							}
							print("Describtion: " + describtionText);
						}
					}
					break;
				}
				case 2:
				{
					curremtSearchResult.seeders = this.htmlResult.getInnerText(currentTag);
					break;
				}
				case 3:
				{
					curremtSearchResult.leechers = this.htmlResult.getInnerText(currentTag);
					curremtSearchResult.engine = this.name;
					searchResults.push(curremtSearchResult);
					break;
				}
			}
			
			tdCounter++;

			if (tdCounter === 4)
			{
				tdCounter = 0;
			}
		}
	}
	
	this.SearchReady(searchResults);
}
ThePirateBayProvider.InitPlugin();


