app.controller('StartController', function($scope, $state, $filter, CountyDataService, PlatsbankenService, JobIdService){
    $scope.error = "";
    $scope.city = "";
    $scope.county = "";
    $scope.jobs = "";
    $scope.isDataInCache = false;
       
    $scope.getCachedPosition = function(){
        var position = CountyDataService.getCachedPosition();
        if(position === null){
           $scope.upDatePosition();
        }
        $scope.updatePositionText(position);
    };
    
    $scope.getCachedJobs = function(){       
        $scope.jobs = PlatsbankenService.getCachedJobs();
        
        if($scope.jobs === null){
            $scope.upDatePosition();
        }
    };
       
    $scope.updatePositionText = function(position){
        $scope.city = position.city;
        $scope.county = position.county;
    };
      
   $scope.upDateJobs = function(countyId){
        PlatsbankenService.upDateJobs(countyId).then(function(){
            $scope.jobs = $scope.getCachedJobs();
        }, function(reason){
            $scope.error = reason;
        });
    };
    
    $scope.getJobs = function(){
        var position = $scope.getCachedPosition();
        var timeDifference = $scope.checkLatestUpdateJobs();
        var milli = 60 * 60 * 1000;
        
        if(timeDifference/milli > 3){
            console.log("dags att uppdater");
            $scope.upDateJobs(position.id);
            
        }else{
            console.log("inte dags att uppdatera");
            $scope.getCachedPosition();
            $scope.isDataInCache = true;
            $scope.getCachedJobs();
        }
    }
    
    $scope.getjobDetails = function(id){
        JobIdService.sendId(id);
       // $location.path('/dashboard')
        $state.go('jobdetails');
    }
    
    $scope.upDatePosition = function(){
        CountyDataService.updateUserPosition().then(function(position){
            $scope.updatePositionText(position);
            $scope.upDateJobs(position.id);
        }, function(reason){
            $scope.error = reason;
        });
    };  
    
    $scope.checkLatestUpdateJobs = function(){
        var lastUpdated = PlatsbankenService.getLatestUpdate();
        lastUpdated = new Date(lastUpdated);
        var now = new Date();
        
        var difference = Math.abs(lastUpdated - now);
        
        return difference;
    }
    
    //check when application loads
    //if first time user update position and jobs
    //if not first time user get cached data
    //if cached jobs are older than three hours update jobs
    if(CountyDataService.getCachedPosition() === null){
        $scope.upDatePosition();
    }else{
       
        $scope.getCachedPosition();
        $scope.isDataInCache = true;
        $scope.getJobs();  
    }   
});
