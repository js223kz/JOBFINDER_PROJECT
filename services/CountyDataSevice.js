app.service('CountyDataService', ['$http', '$geolocation', '$q', function($http, $geolocation, $q){

        //get device latitude and longitude
        this.getUserPosition =  function(){
            return $q(function(resolve, reject){
                var geolocation = $geolocation;
                geolocation.getCurrentPosition().then(function(location) {
                var position = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                }
                if(!location.coords.error){
                    resolve(position);
                }else{
                    reject("Vi kan inte hämta din position för tillfället.");
                }
                });        
            });
        },
    
        //get position information from google maps
        this.getCountyName = function(position){
            var baseUrl = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=';
            return $q(function(resolve, reject){
                $http.get(baseUrl + position.lat + ',' + position.lng)
                .success(function(response){
                    resolve(response);
                    //getCountyCode(response);
                }).error(function(error){
                    reject("Vi kan för tillfället inte hämta information om din position. Försök igen!");
                });    
                
            });
        },
    
        //retrieve county name and city name from json returned by Google maps    
        this.getCountyCode = function(json){
            return $q(function(resolve, reject){
                var position = {
                    city: undefined,
                    county: undefined
                }
                //getting name of county (always on the same position in json response)
                var countyPosition = json["results"].length -2;
                var county = json["results"][countyPosition].formatted_address;
                position.county = county.split(',')[0];

                //getting name of city (always on the same position in json response)
                var cityPosition = json["results"].length -4;
                var city = json["results"][cityPosition].formatted_address;
                position.city = city.split(',')[0];

                if(position.city != undefined || position.county != undefined){
                    resolve(position);
                }else{
                    reject("Vi kan för tillfället inte hämta information om din position. Försök igen!")
                }
            }); 
        },
    
        //get county id from static json file with counties and id:s
        this.getCountyId = function(county){
            return $q(function(resolve, reject){
                $http.get("files/counties.json").success(function(response){
                angular.forEach(response, function(value, index) {
                    if(value.name == county){
                        resolve(value.id);
                    }else{
                        reject("Länet du befinner dig i finns inte listan. Vi kan tyvärr inte hämta information från Platsbanken.");
                    }
                });

                }).error(function(error){
                    reject("Vi kan för tillfället inte avgöra vilket län du befinner dig och därför inte hämta information från Platsbanken.");
                });
            });
        }   
}]);