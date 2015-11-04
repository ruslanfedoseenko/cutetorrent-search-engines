var MegaSharaProvider = new CustomScriptSearchProvider();
MegaSharaProvider.InitPlugin = function() {
	this.name = "MegaShara";
	this.url = "http://megashara.com/";
	this.supportedCategories = Enums.All;
	this.responseType = Enums.HTML
	this.requestType = Enums.GET;
    this.category_map = [];
	this.category_map[Enums.Anime]="0";
	this.category_map[Enums.Music]="2";
	this.category_map[Enums.TV]="5";
	this.category_map[Enums.Porn]="0";
	this.category_map[Enums.Software]="0";
	this.category_map[Enums.Games]="3";
	this.category_map[Enums.Books]="0";
	this.category_map[Enums.Movie]="1";
    MegaSharaProvider.HtmlResultReady.connect(MegaSharaProvider, "OnHtmlResultReady");
}

MegaSharaProvider.BuildUrl = function(token, category, page) {
    return "http://megashara.com/search/?text=" + token +"&all_words=0&where=title&parent="+ this.category_map[category] + "&time=ALL&sorting=seed&order=desc";
	
}

MegaSharaProvider.OnHtmlResultReady = function()
{
	
	if (this.htmlResult !== undefined)
	{
		var tableBody = this.htmlResult.getElementsByName("table","class", "table-wide");
		
		if (tableBody.length > 0)
		{
			this.ParseTableBody(tableBody);
		}
	}
}

MegaSharaProvider.ParseTableBody = function(tableBody)
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
						if (child.Name.toUpperCase() === "A")
						{
							curremtSearchResult = new SearchResult();
							var url = child.getAttributeValue("href");
							
							curremtSearchResult.name = this.htmlResult.getInnerText(child);
							curremtSearchResult.torrentDescUrl = url;
						}
					}
					break;
				}
				case 2:
				{
					var childCount = currentTag.Children.length;
					for(var i = 0; i < childCount; i++)
					{
						var child = currentTag.Children[i];
						if (child.Name.toUpperCase() === "A")
						{
							var url = child.getAttributeValue("href");
							print(url);
							curremtSearchResult.torrentFileUrl = url;
						}
					}
					break;
				}
				case 3:
				{
					if (currentTag.Children.length > 1)
					{
						break;
					}
					var sizeStr = this.htmlResult.getInnerText(currentTag.Children[0]);
					sizeStrLowerCase = sizeStr.toLowerCase();
					if (sizeStrLowerCase.indexOf(" tb") > -1 ||  sizeStrLowerCase.indexOf(" gb") > -1 || sizeStrLowerCase.indexOf(" mb") > -1 || sizeStrLowerCase.indexOf(" kb") > -1 || sizeStrLowerCase.indexOf(" b") > -1)
					{
						var parts1 = sizeStrLowerCase.split(' ');
						
						var size = parseFloat(parts1[0]);
						var kbPart = parts1[1];
						print(sizeStrLowerCase);
						print(size);
						print(kbPart);
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
					break;
				}
				case 4:
				{
					print(this.htmlResult.getInnerText(currentTag));
					curremtSearchResult.seeders = this.htmlResult.getInnerText(currentTag);
					break;
				}
				
				case 5:
				{
					print(this.htmlResult.getInnerText(currentTag));
					curremtSearchResult.leechers = this.htmlResult.getInnerText(currentTag);
					curremtSearchResult.engine = this.name;
					searchResults.push(curremtSearchResult);
					break;
				}
			}
			
			tdCounter++;

			if (tdCounter === 6)
			{
				tdCounter = 0;
			}
		}
	}
	
	this.SearchReady(searchResults);
}
MegaSharaProvider.InitPlugin();


