var RutorSearchProvider = new CustomScriptSearchProvider();
RutorSearchProvider.InitPlugin = function() {
	this.name = "Rutor";
	this.url = "http://rutor.org/";
	this.supportedCategories = Enums.All;
	this.responseType = Enums.HTML
	this.requestType = Enums.GET;
    this.category_map = [];
	this.category_map[Enums.Anime]="10";
	this.category_map[Enums.Music]="2";
	this.category_map[Enums.TV]="6";
	this.category_map[Enums.Porn]="1";
	this.category_map[Enums.Software]="9";
	this.category_map[Enums.Games]="8";
	this.category_map[Enums.Books]="11";
	this.category_map[Enums.Movie]="1";
    RutorSearchProvider.HtmlResultReady.connect(RutorSearchProvider, "OnHtmlResultReady");
}

RutorSearchProvider.BuildUrl = function(token, category, page) {
    	if (category === Enums.All)
	{
		return "http://rutor.org/search/" + (page - 1) + "/0/110/2/" + token;	
	}
	else
	{
        return "http://rutor.org/search/" + (page - 1) + "/" + this.category_map[category] + "/110/2/" + token;
	}
	
}

RutorSearchProvider.OnHtmlResultReady = function()
{
	
	if (this.htmlResult !== undefined)
	{
		var tableBody = this.htmlResult.getElementsByName("tr","class", "gai");
		tableBody.push.apply(tableBody, this.htmlResult.getElementsByName("tr","class", "tum"))
		if (tableBody.length > 0)
		{
			this.ParseTableBody(tableBody);
		}
	}
}

RutorSearchProvider.ParseTableBody = function(tableBody)
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
							var url = child.getAttributeValue("href");
							
							if (url.indexOf("/download") === 0)
							{
								curremtSearchResult = new SearchResult();
								curremtSearchResult.torrentFileUrl = this.url + url;
							
							}
							else if (url.indexOf("/torrent") === 0)
							{
								curremtSearchResult.name = this.htmlResult.getInnerText(child);
								curremtSearchResult.torrentDescUrl = this.url + url;
							}
						}
					}
					break;
				}
				case 2:
				case 3:
				{
					if (currentTag.Children.length > 1)
					{
						break;
					}
					var sizeStr = this.htmlResult.getInnerText(currentTag);
					sizeStr = sizeStr.replace("&nbsp;"," ");
					sizeStrLowerCase = sizeStr.toLowerCase();
					if (sizeStrLowerCase.indexOf(" tb") > -1 ||  sizeStrLowerCase.indexOf(" gb") > -1 || sizeStrLowerCase.indexOf(" mb") > -1 || sizeStrLowerCase.indexOf(" kb") > -1 || sizeStrLowerCase.indexOf(" b") > -1)
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
					break;
				}
				case 4:
				{
					var childCount = currentTag.Children.length;
					for(var i = 0; i < childCount; i++)
					{
						var child = currentTag.Children[i];
						
						if (child.Name.toLowerCase() == "span")
						{
							if (child.checkAttribute("class", "green"))
							{
								var innerHtml = this.htmlResult.getInnerText(child);
								innerHtml = innerHtml.replace("&nbsp;"," ");
								var innerTagEnd = innerHtml.indexOf('>');
								
								if (innerTagEnd < 0)
								{
									curremtSearchResult.seeders = -1;
								}
								else
								{
									var seedStr = innerHtml.substring(innerTagEnd + 1).trim();
									var seedCount = parseInt(seedStr);
									
									if (isNaN(seedCount))
									{
										curremtSearchResult.seeders = -1;
									}
									else{
										curremtSearchResult.seeders = seedStr;
									}
								}
							}
							else if (child.checkAttribute("class", "red"))
							{
								var innerHtml = this.htmlResult.getInnerText(child);
								innerHtml = innerHtml.replace("&nbsp;"," ").trim();
								var leechCount = parseInt(innerHtml);
								
								if (isNaN(leechCount))
								{
									curremtSearchResult.leechers = -1;
								}
								else{
									curremtSearchResult.leechers = innerHtml;
								}
							}
						}
					}
					curremtSearchResult.engine = this.name;
					searchResults.push(curremtSearchResult);
					break;
				}
			}
			
			tdCounter++;

			if (tdCounter === 5)
			{
				tdCounter = 0;
			}
		}
	}
	
	this.SearchReady(searchResults);
}
RutorSearchProvider.InitPlugin();


