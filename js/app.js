
var infowindow;

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: new google.maps.LatLng(40.299159, -74.623803),
    mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    infowindow = new google.maps.InfoWindow({
        maxWidth: 250
    });

    var markersArray = [];
    // create markers
    function point(name, lat, long, URL, phone, address) {
        var self = this;
        this.name = ko.observable(name);
        this.lat = ko.observable(lat);
        this.long = ko.observable(long);
        this.URL = ko.observable(URL);
        this.phone = ko.observable(phone);
        this.address = ko.observable(address);
        this.showMe = ko.observable(true);
        
        createMarker(this);
    }

    // Set marker for the map
    function createMarker(point) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(point.lat(), point.long()),
            title: point.name(),
            url: point.URL(),
            place_id: point.place_id,
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            icon: "http://chart.apis.google.com/chart?chst=d_bubble_icon_text_small_withshadow&chld=shoppingcart|bbT|" + point.name() + "|018E30|E0EBEB",
        });

        point.marker = marker;

        // click the list item to match the corresponding marker
        markersArray.push(marker);

        this.clickMarker = function(point) {
            for(var e in markersArray){
                if(point.place_id === markersArray[e].place_id) {
                    map.panTo(markersArray[e].position);
                    google.maps.event.trigger(point.marker, "click");
                }
            }
        }

        // Add click event for marker animation and call toggleBounce function to get yelp data for InfoWindow
        google.maps.event.addListener(marker,'click', toggleBounce);

        function toggleBounce() {

            marker.setAnimation(google.maps.Animation.BOUNCE);

            // use timer to turn off marker animation
            window.setTimeout(function(){
                marker.setAnimation(null);
            }, 1400);

            // get yelp data and call infowindow in the function
            getYelpData(point);
        }
    }

    // set up Yelp API
    function getYelpData(point) {
        // Uses the oauth-signature package installed with bower per https://github.com/bettiolo/oauth-signature-js

        // Use the GET method for the request
        var httpMethod = 'GET';

        // Yelp API request url
        var yelpURL = 'http://api.yelp.com/v2/search/';

        // nonce generator
        // function credit of: https://blog.nraboy.com/2015/03/create-a-random-nonce-string-using-javascript/
        var nonce = function(length) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for(var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };

        // Set required parameters for authentication & search
        var parameters = {
            oauth_consumer_key: 'fJ45yavr0nF1erJ1CsYCSw',
            oauth_token: 'SSxrGbL3HbWkEKbsifpawu1Qufomd2u2',
            oauth_nonce: nonce(20),
            oauth_timestamp: Math.floor(Date.now() / 1000),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version: '1.0',
            callback: 'cb',
            term: point.name(),
            location: 'West Windsor, NJ', // always search within West Windsor, NJ
            limit: 1
        };

        // Set other API parameters
        var consumerSecret = '-p7pomXQZokThyyOLfNZD9HhZUI';
        var tokenSecret = 'Q5gKBSLISrcNZpw0fHQo90yyTVc';

        // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
        var signature = oauthSignature.generate(httpMethod, yelpURL, parameters, consumerSecret, tokenSecret);

        // Add signature to list of parameters
        parameters.oauth_signature = signature;

        // Set up the ajax settings
        var ajaxSettings = {
            url: yelpURL,
            data: parameters,
            cache: true,
            dataType: 'jsonp',
            success: function(response) {
                // Add content for InfoWindow
                var contentString = '<div id="content">' +
                    '<h4>' + point.name() + '</h4>' + '<p id="text"> <a id="yelp-url"> Rating on Yelp </a> ' + '<img id="yelp" src="' + response.businesses[0].rating_img_url + '"></p>'
                    + '<p><b>' + point.name() + '</b>, is an organic supermarket ' +
                    '<a href="' + point.URL()+ '">' +
                    point.URL() + '</a></p>' +
                    '</div>';

                    infowindow.setContent(contentString);
                    infowindow.open(map,point.marker);

                // Update the infoWindow to display the yelp rating image
                $('#yelp').attr("src", response.businesses[0].rating_img_url);
                $('#yelp-url').attr("href", response.businesses[0].url);
            },

            // Show error message when Yelp API is not working properly and no rating information is available
            error: function() {
                var contentString = '<div id="content">' +
                    '<h4>' + point.name() + '</h4>' + '<p id="text" style="color: red">' + '</p>'
                    + '<p><b>' + point.name() + '</b>, is an organic supermarket ' +
                    '<a href="' + point.URL()+ '">' +
                    point.URL() + '</a></p>' +
                    '</div>';

                    infowindow.setContent(contentString);
                    infowindow.open(map,point.marker);
                $('#text').html('Sorry, rating could not be retrieved from yelp.');
            }
        };

        // Send off the ajax request to Yelp
        $.ajax(ajaxSettings);
    };

    // Set multiple markers
    var viewModel = {
        points: ko.observableArray([
            new point('McCaffrey', 40.292691, -74.583216, 'http://mccaffreys.com/', '(609) 301-8718', '761 Rt 33 W, Hightstown, NJ 08520'),
            new point('Mrs. Green', 40.313247, -74.620875, 'http://mrsgreens.com/', '(609) 373-6030', '64 Princeton Hightstown Rd, West Windsor, NJ 08550'),
            new point('Whole Food', 40.308153, -74.667866, 'http://www.wholefoodsmarket.com/', '(609) 799-2919', '3495 US Hwy 1, Princeton, NJ 08540'),
            new point('Trader Joe', 40.310902, -74.661156, 'http://www.traderjoes.com/', '(609) 897-0581', '3528 Brunswick Pike, Princeton, NJ 08540'),
            new point('Wegmans', 40.306241, -74.674985, 'http://www.wegmans.com/', '(609) 919-9300', '240 Nassau Park Blvd, Princeton, NJ 08540')]),
        mapControl: map,
        query: ko.observable(''),
        //search filters
        search: function(value) {
            for(var x in viewModel.points()) {
                if(viewModel.points()[x].name().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    viewModel.points()[x].showMe(true);
                    viewModel.points()[x].marker.setVisible(true);
                } else {
                    viewModel.points()[x].showMe(false);
                    viewModel.points()[x].marker.setVisible(false);
                }
            }
        }
    };

    viewModel.query.subscribe(viewModel.search);
    ko.applyBindings(viewModel);

    //Hide and Show filter on clicking the arrow icon and change the icon as well
    var FilterVisible = true;
    var ArrowClick = 0;

    function noNav() {
        $("#filter").hide();
        $("#arrow").attr("src", "images/down-arrow.gif");
        FilterVisible = false;
    }
    function yesNav() {
        $("#filter").show();
        $("#arrow").attr("src", "images/up-arrow.gif");
        FilterVisible = true;
    }

    function hideNav() {
        ArrowClick = 1;
        if(FilterVisible === true) {
            noNav();
        } else {
            yesNav();
        }
    }

    $("#arrow").click(hideNav);

    //To be responsive when resizing the google map
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
        if (ArrowClick == 0) {
            if($(window).width() < 899) {
            hideNav();
            }
        }
    });
}

//Error handling for google map API
var text = '<strong>Google Map API is not working right now</strong>';
function googleError(){
    //Show error message on the screen when goole API is not working properly.
    var paragraph1 = '<div> &nbsp;</div>'
    var paragraph2 = '<div class="page-header" style="text-align: center; font-size: 25px;"' + '">' + text + '</div>' + '</div>';

    $('#map').append(paragraph1);
    $('#map').append(paragraph2);
}