
/* set marker */
function point(name, lat, long, URL, phone, address) {
    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.URL = ko.observable(URL);
    this.phone = ko.observable(phone);
    this.address = ko.observable(address)
    this.showMe = ko.observable(true);

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        title: name,
        url: URL,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        icon: "http://chart.apis.google.com/chart?chst=d_bubble_icon_text_small_withshadow&chld=shoppingcart|bbT|" + name + "|018E30|E0EBEB",
    });

    //set marker initial property to be visible in order to hide and show later during search
    this.marker = marker;
    marker.setVisible(true);

    //if you need the poition while dragging
    google.maps.event.addListener(marker, 'drag', function() {
        var pos = marker.getPosition();
        this.lat(pos.lat());
        this.long(pos.lng());
    }.bind(this));

    //if you just need to update it when the user is done dragging
    google.maps.event.addListener(marker, 'dragend', function() {
        var pos = marker.getPosition();
        this.lat(pos.lat());
        this.long(pos.lng());
    }.bind(this));

    // Add content for InfoWindow
    var contentString = '<div id="content">'+
            '<h4>'+name+'</h4>'+
            '<div>'+
            '<p><b>'+name+'</b>, is an organic supermarket '+
            '<a href="'+URL+'">'+
            URL+'</a></p>'+
            '</div>'+
            '</div>';

    // InfoWindow   
    var infowindow = new google.maps.InfoWindow({
          content: contentString,
          maxWidth: 250
        });
    
    // Add click event for marker animation and InfoWindow
    google.maps.event.addListener(marker,'click', toggleBounce);
    
    function toggleBounce() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          infowindow.open(map, marker);
        }
      }

    // disable marker animation when infowindow is closed
        google.maps.event.addListener(infowindow, 'closeclick', function() {  
            marker.setAnimation(null); 
        });
}

// init map
var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: new google.maps.LatLng(40.299159, -74.623803),
    mapTypeId: google.maps.MapTypeId.ROADMAP
});

// set multiple markers
var viewModel = {
    points: ko.observableArray([
        new point('McCaffrey', 40.292691, -74.583216, 'http://mccaffreys.com/', '(609) 301-8718', '761 Rt 33 W, Hightstown, NJ 08520'),
        new point('Mrs. Green', 40.313247, -74.620875, 'http://mrsgreens.com/', '(609) 373-6030', '64 Princeton Hightstown Rd, West Windsor, NJ 08550'),
        new point('Whole Food', 40.308153, -74.667866, 'http://www.wholefoodsmarket.com/', '(609) 799-2919', '3495 US Hwy 1, Princeton, NJ 08540'),
        new point('Trader Joe', 40.310902, -74.661156, 'http://www.traderjoes.com/', '(609) 897-0581', '3528 Brunswick Pike, Princeton, NJ 08540'),
        new point('Wegmans', 40.306241, -74.674985, 'http://www.wegmans.com/', '(609) 919-9300', '240 Nassau Park Blvd, Princeton, NJ 08540')]),
    mapControl: map,
    query: ko.observable(''),
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

//Hide and Show filter on click the arrow icon and change the icon as well
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

//google map resize to be responsive
google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
    if (ArrowClick == 0) {
        if($(window).width() < 899) {
            hideNav();
        } else {
            showNav();
        }
    }
});
