var BitSnoopProvider = new CustomScriptSearchProvider();
BitSnoopProvider.InitPlugin = function() {
	this.name = "BitSnoop";
	this.url = "http://bitsnoop.com/";
	this.supportedCategories = Enums.All;
	this.responseType = Enums.HTML
	this.requestType = Enums.GET;
    this.category_map = [];
	this.category_map[Enums.All]="all";
	this.category_map[Enums.Anime]="all";
	this.category_map[Enums.Music]="audio";
	this.category_map[Enums.TV]="all";
	this.category_map[Enums.Porn]="all";
	this.category_map[Enums.Software]="software";
	this.category_map[Enums.Games]="games";
	this.category_map[Enums.Books]="all";
	this.category_map[Enums.Movie]="video";
	this.custom_headers = {};
	this.custom_headers["Host"] ="bitsnoop.com";
	this.custom_headers["Connection"] ="keep-alive";
	this.custom_headers["Accept"] ="text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
	this.custom_headers["User-Agent"] =" Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36";
	this.custom_headers["Accept-Encoding"] ="deflate, sdch";
	this.custom_headers["Accept-Language"] ="ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,eu;q=0.2,uk;q=0.2,fr;q=0.2";
	
    BitSnoopProvider.HtmlResultReady.connect(BitSnoopProvider, "OnHtmlResultReady");
}

BitSnoopProvider.BuildUrl = function(token, category, page) {
	var url = "http://bitsnoop.com/search/"+this.category_map[category]+"/" +token + "/c/d/1/";
	this.custom_headers["Referer"] = url;
    return url+ "?fmt=rss";
	
	
}

BitSnoopProvider.OnHtmlResultReady = function()
{
	if (this.htmlResult !== undefined)
	{
		var tableBody = this.htmlResult.getElementsByName("item");
		if (tableBody.length > 0)
		{
			this.ParseTableBody(tableBody);
		}
	}
}

BitSnoopProvider.ParseTableBody = function(tableBody)
{
	var searchResults = [];
	
	for(var i=0; i< tableBody.length; i++)
	{
		var curremtSearchResult = new SearchResult();
		var searchItem = tableBody[i];
		for(var j =0; j< searchItem.Children.length; j++)
		{
			var child = searchItem.Children[j];
			if (child.Name.toUpperCase() == "TITLE")
			{
				curremtSearchResult.name = this.htmlResult.getInnerText(child);
			}
			else if(child.Name.toUpperCase() == "LINK")
			{
				curremtSearchResult.torrentDescUrl = this.htmlResult.getInnerText(child);
			}
			else if(child.Name.toUpperCase() == "ENCLOSURE" && child.checkAttribute("type", "application/x-bittorrent"))
			{
				curremtSearchResult.torrentFileUrl = child.getAttributeValue("url");
			}
			else if(child.Name.toUpperCase() == "SIZE")
			{
				curremtSearchResult.size = this.htmlResult.getInnerText(child);
			}
			else if(child.Name.toUpperCase() == "NUMSEEDERS")
			{
				curremtSearchResult.seeders = this.htmlResult.getInnerText(child);
			}
			else if(child.Name.toUpperCase() == "NUMLEECHERS")
			{
				curremtSearchResult.leechers = this.htmlResult.getInnerText(child);
			}
			
		}
		curremtSearchResult.engine = this.name;
		searchResults.push(curremtSearchResult);
	}
	
	this.SearchReady(searchResults);
}
BitSnoopProvider.InitPlugin();


