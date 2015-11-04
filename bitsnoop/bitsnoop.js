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
	this.custom_headers["Host"] ="bitsnoop.com";
	this.custom_headers["Connection"] ="keep-alive";
	this.custom_headers["Cache-Control"] ="max-age=0";
	this.custom_headers["Accept"] ="text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
	this.custom_headers["User-Agent"] =" Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36";
	this.custom_headers["Accept-Encoding"] ="gzip, deflate, sdch";
	this.custom_headers["Accept-Language"] ="ru,en-US;q=0.8,en;q=0.6";
	
    BitSnoopProvider.HtmlResultReady.connect(BitSnoopProvider, "OnHtmlResultReady");
}

BitSnoopProvider.BuildUrl = function(token, category, page) {
	
    return "http://bitsnoop.com/search?q=" +token + "&t=" +  this.category_map[category];
	
	
}

BitSnoopProvider.OnHtmlResultReady = function()
{
	print("OnHtmlResultReady");
	if (this.htmlResult !== undefined)
	{
		var tableBody = this.htmlResult.getElementsByName("ol","id", "torrents");
		
		if (tableBody.length > 0)
		{
			this.ParseTableBody(tableBody);
		}
	}
}

BitSnoopProvider.ParseTableBody = function(tableBody)
{
	var traverseQueue = [];
	traverseQueue.push.apply(traverseQueue, tableBody);
	var tdCounter = 0;
	var searchResults = [];
	var curremtSearchResult;
	while(traverseQueue.length > 0)
	{
		var currentTag = traverseQueue.shift();
		traverseQueue.push.apply(traverseQueue, currentTag.Children);
		var curremtSearchResult;
		if (currentTag.Name.toUpperCase() == "LI")
		{
			for(var i = 0; i < currentTag.Children.length; i++)
			{
				var child = currentTag.Children[i];
				if (child.Name.toUpperCase == "DIV" && child.checkAttribute("id", "sz"))
				{
					var sizeItem = child.Children[0].Children[0].Children[0];
					if (sizeItem)
					{
						print(this.htmlResult.getInnerText(sizeItem));
					}
				}
			}
		}
	}
	
	this.SearchReady(searchResults);
}
BitSnoopProvider.InitPlugin();


