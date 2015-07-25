var ExtratorrentSearchProvider = new CustomScriptSearchProvider();
ExtratorrentSearchProvider.InitPlugin = function() {
	this.name = "Extratorrent";
	this.url = "http://extratorrent.cc";
	this.supportedCategories = Enums.All;
	this.responseType = Enums.HTML;
	this.requestType = Enums.GET;
	this.category_map = [];
	this.category_map[Enums.Anime]="1";
	this.category_map[Enums.Music]="5";
	this.category_map[Enums.TV]="8";
	this.category_map[Enums.Porn]="533";
	this.category_map[Enums.Software]="7";
	this.category_map[Enums.Games]="3";
	this.category_map[Enums.Books]="2";
	this.category_map[Enums.Movie]="4";
    ExtratorrentSearchProvider.HtmlResultReady.connect(ExtratorrentSearchProvider, "OnHtmlResultReady");
}

ExtratorrentSearchProvider.BuildUrl = function(token, category, page) {
    if (category === Enums.All)
	{
		return "http://extratorrent.cc/advanced_search/?with=" + token + "&page=" + page;
	}
	else
	{
        return "http://extratorrent.cc/advanced_search/?with=" + token + "&s_cat=" + this.category_map[category] +"&page=" + page;
	}
	
}

ExtratorrentSearchProvider.OnHtmlResultReady = function()
{
	
		if (this.htmlResult !== undefined)
		{
			var tags = this.htmlResult.getElementsByAtribute("class", "tl");
			
			if (tags.length > 0)
			{
				if (tags.length > 1)
				{
					throw "More that one results table found";
				}
				
				var resaltsTable = tags[0];
				var tableBody = [];
				
				for(var i=0; i<resaltsTable.Children.length; i++)
				{
					var child = resaltsTable.Children[i];
					
					if (child.Name.toLowerCase() === "tr")
					{
						tableBody.push(child);
					}
				}
				
				if (tableBody.length > 0)
				{
					this.ParseTableBody(tableBody);
				}
			}
		}
}

ExtratorrentSearchProvider.ParseTableBody = function(tableBody)
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
				case 0:
				{
					var childCount = currentTag.Children.length;
					for(var i = 0; i < childCount; i++)
					{
						var child = currentTag.Children[i];
						if (child.Name.toUpperCase() === "A")
						{
							curremtSearchResult = new SearchResult();
							curremtSearchResult.torrentFileUrl = this.url + child.getAttributeValue("href").replace("torrent_download", "download");
							break;
						}
					}
					break;
				}
				case 1: 
				{
					break;
				}
				case 2:
				{
					if (currentTag.checkAttribute("class", "tli"))
					{
						var childCount = currentTag.Children.length;
						for(var i = 0; i < childCount; i++)
						{
							var child = currentTag.Children[i];
							if (child.Name.toUpperCase() === "A")
							{
								curremtSearchResult.name = this.htmlResult.getInnerText(child);
								curremtSearchResult.torrentDescUrl = this.url + child.getAttributeValue("href");
							}
						}
					}
					break;
				}
				case 3:
				{
					var sizeStr = this.htmlResult.getInnerText(currentTag);
					sizeStr = sizeStr.replace("&nbsp;"," ");
					sizeStrLowerCase = sizeStr.toLowerCase();
					if (sizeStrLowerCase.indexOf(" tb") > -1 ||  sizeStrLowerCase.indexOf(" gb") > -1 || sizeStrLowerCase.indexOf(" mb") > -1 || sizeStrLowerCase.indexOf(" kb") > -1 || sizeStrLowerCase.indexOf(" b") > -1)
					{
						var parts1 = sizeStr.split(' ');
						
						var size = parseFloat(parts1[0]);
						
						if (!isNaN(size))
						{
							curremtSearchResult.size = sizeStr;
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
					var seedStr = this.htmlResult.getInnerText(currentTag);
					var seedCount = parseInt(seedStr);
					
					if (isNaN(seedCount))
					{
						curremtSearchResult.seeders = -1;
					}
					else
					{
						curremtSearchResult.seeders = seedStr;
					}
					break;
				}
				case 5:
				{
					var peerStr = this.htmlResult.getInnerText(currentTag);
					var peerCount = parseInt(peerStr);
					
					if (isNaN(peerCount))
					{
						curremtSearchResult.leechers = -1;
					}
					else
					{
						curremtSearchResult.leechers = peerStr;
					}
					break;
				}
				case 6:
				{
					curremtSearchResult.engine = this.name;
					searchResults.push(curremtSearchResult);
					break;
				}
			}
			
			tdCounter++;

			if (tdCounter === 7)
			{
				tdCounter = 0;
			}
		}
	}
	
	this.SearchReady(searchResults);
}
ExtratorrentSearchProvider.InitPlugin();


