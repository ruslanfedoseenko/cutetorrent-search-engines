var KickassSearchProvider = new CustomScriptSearchProvider();
KickassSearchProvider.InitPlugin = function() {
	this.name = "KickassTorrents";
	this.url = "http://kat.cr/";
	this.supportedCategories = Enums.All;
	this.responseType = Enums.JSON;
	this.requestType = Enums.GET;
    	this.category_map = [];
	this.category_map[Enums.Anime]="anime";
	this.category_map[Enums.Music]="music";
	this.category_map[Enums.TV]="tv";
	this.category_map[Enums.Porn]="xxx";
	this.category_map[Enums.Software]="applications";
	this.category_map[Enums.Games]="games";
	this.category_map[Enums.Books]="books";
	this.category_map[Enums.Movie]="movies";
    this.JsonResultReady.connect(this, "OnJsonResultReady");
}

KickassSearchProvider.BuildUrl = function(token, category, page) {
    	if (category === Enums.All)
	{
		return "http://kat.cr/json.php?q=" +token + "&field=seeders&order=desc&page=" + page.toString();	
	}
	else
	{
        	return "http://kat.cr/json.php?q=" + token + "+category:" + this.category_map[category] + "&field=seeders&order=desc&page=" + page.toString();
	}
	
}

KickassSearchProvider.OnJsonResultReady = function()
{
    print("OnJsonResultReady called");
    if (this.jsonResult !== undefined && this.jsonResult.list!== undefined)
    {
        var searchResults = [];
        for (var i =0; i< this.jsonResult.list.length;i++)
        {
            var item = this.jsonResult.list[i];
            var searchResult = new SearchResult();
            searchResult.engine = this.name;
            searchResult.name = item.title;
            searchResult.torrentFileUrl = item.torrentLink;
            searchResult.torrentDescUrl = item.link;
            searchResult.leechers = item.leechs;
            searchResult.seeders = item.seeds;
            searchResult.size = item.size;
            searchResults.push(searchResult);
        }
        this.SearchReady(searchResults);
    }

}

KickassSearchProvider.InitPlugin();


