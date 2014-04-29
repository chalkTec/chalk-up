'use strict';

angular.module('chalkUpAdmin')
	.controller('AdminCtrl', function ($scope, $stateParams, $modal, $state, moment, user, feedbackService, gymService, routesMapService, routesTableService, errorService) {
		$scope.gymId = parseInt($stateParams.id);

        var gymLoad = gymService.loadGym($scope.gymId);
        gymLoad.catch(function () {
            $scope.gymLoadError = true;
        });

        var routesLoad = gymService.loadRoutes($scope.gymId);
        routesLoad.catch(function () {
            $scope.routesLoadError = true;
        });

        gymLoad.then(function (gym) {
            $scope.floorPlan = gym.floorPlans[0];

            routesMapService.updatePlan($scope.floorPlan);
            $scope.gym = gym;

            routesLoad.then(function (routes) {
                routesMapService.updateRoutes(routes);
                routesTableService.updateRoutes(routes);

                $scope.routes = routes;
            });
        });

        routesMapService.onSelectionChange($scope, function (route) {
            routesTableService.select(route);
            $scope.selected = route;
        });

        routesTableService.onSelectionChange($scope, function (route) {
            routesMapService.select(route);
            $scope.selected = route;
        });


        var openEditModal = function (route, gym) {
            return $modal.open({
                templateUrl: '/views/modules/admin/edit-route.html',
                windowClass: 'small edit',
                controller: ['$scope', function ($scope) {
                    $scope.gym = gym;
                    $scope.route = route;
                    $scope.route.dateSetDate = moment($scope.route.dateSet).toDate();

                    $scope.save = function (route) {
                        route.dateSet = moment(route.dateSetDate).format();
                        delete route.dateSetDate;
                        $scope.$close(route);
                    };
                    $scope.discard = function () {
                        $scope.$dismiss();
                    };
                }]
            });
        };


        var routeTemplate = {
            type: 'sport-route',
            color: {
                name: 'RED'
            },
            location: {
                x: 0,
                y: 0
            },
            initialGrade: {
                uiaa: '7+',
                font: '6c+'
            }
        };

        $scope.newRoute = function (gym, floorPlan) {
            var newRoute = _.cloneDeep(routeTemplate);
            newRoute.gym = gym;
            newRoute.location.floorPlan = floorPlan;

            var editModal = openEditModal(newRoute, gym);

            editModal.result.then(function (editedRoute) {
                gymService.createRoute(gym, editedRoute)
                    .then(function (createdRoute) {
                        $scope.routes.push(createdRoute);

                        routesMapService.updateRoutes($scope.routes);
                        routesTableService.updateRoutes($scope.routes);

                        routesMapService.select(createdRoute);
                        routesTableService.select(createdRoute);
                        $scope.selected = createdRoute;

                        // update template to reflect last created route
                        routeTemplate.type = createdRoute.type;
                        routeTemplate.color = createdRoute.color;
                        if(createdRoute.type === 'sport-route') {
                            routeTemplate.initialGrade.uiaa = createdRoute.initialGrade.uiaa;
                        }
                        if(createdRoute.type === 'boulder') {
                            routeTemplate.initialGrade.font = createdRoute.initialGrade.font;
                        }
                    })
                    .catch(function (error) {
                        errorService.restangularError(error);
                    });
            });
            editModal.result.catch(function () {
                // nothing to do, we just do not create the route
            });
        };

        $scope.getRoutesForCsv = function() {
            return _.map($scope.routes, function(route) {
                var exportRoute = {
                    type: undefined,
                    name: route.name,
                    number: route.number,
                    grade: undefined,
                    color: route.color.germanName,
                    description: route.description,
                    dateSet: moment(route.dateSet).format('DD.MM.YYYY'),
                    end: route.end ? moment(route.end).format('DD.MM.YYYY') : undefined
                };

                if(route.type === 'sport-route') {
                    exportRoute.type = 'Sportklettertour';
                    exportRoute.grade = route.initialGrade.uiaa;
                }
                else if(route.type === 'boulder') {
                    exportRoute.type = 'Boulder';
                    exportRoute.grade = route.initialGrade.font;
                }
                else {
                    throw new Error('route type not known');
                }

                return exportRoute;
            });
        };

        $scope.csvHeader = ['Typ', 'Name', 'Nummer', 'Grad', 'Farbe', 'Beschreibung', 'geschraubt am', 'abgeschraubt am'];
        $scope.filename = 'routes-' + moment().format() + '.csv';

        $scope.editRoute = function (route) {
            // clone the route, so nothing changes until the editing is saved and discard just needs to do nothing
            var editModal = openEditModal(route.clone(), $scope.gym);

            editModal.result.then(function (editedRoute) {
                gymService.updateRoute(editedRoute)
                    .then(function (updatedRoute) {
                        var oldRoute = _.find($scope.routes, function (route) {
                            return route.id === updatedRoute.id;
                        });
                        _.assign(oldRoute, updatedRoute);
                        routesMapService.updateRoute(updatedRoute);
                    })
                    .catch(function (error) {
                        errorService.restangularError(error);
                    });
            });
            editModal.result.catch(function () {
                // nothing to do, we just do not merge the route
            });
        };

        $scope.movingRoute = undefined;

        var oldLocation;
        $scope.moveRoute = function (route) {
            $scope.movingRoute = route;
            oldLocation = { x: route.location.x, y: route.location.y };
            routesMapService.moveRouteStart(route);
        };

        $scope.saveLocation = function () {
            gymService.updateRoute($scope.movingRoute)
                .catch(function (error) {
                    errorService.restangularError(error);
                });
            routesMapService.moveRouteEnd($scope.movingRoute);
            $scope.movingRoute = undefined;
        };
        $scope.discardLocation = function () {
            routesMapService.moveRouteEnd($scope.movingRoute);
            $scope.movingRoute.location.x = oldLocation.x;
            $scope.movingRoute.location.y = oldLocation.y;
            routesMapService.updateRoute($scope.movingRoute);
            $scope.movingRoute = undefined;
        };


        $scope.archiveRoute = function (route) {
            var date = moment().toDate();
            gymService.archiveRoute(route, date)
                .then(function (archivedRoute) {
                    _.remove($scope.routes, function(route) {
                        return route.id === archivedRoute.id;
                    });

                    routesMapService.updateRoutes($scope.routes);
                    routesTableService.updateRoutes($scope.routes);
                })
                .catch(function (error) {
                    errorService.restangularError(error);
                });
        };

        $scope.deleteRoute = function (routeToDelete) {
            gymService.deleteRoute(routeToDelete)
                .then(function () {
                    _.remove($scope.routes, function(route) {
                        return route.id === routeToDelete.id;
                    });

                    routesMapService.updateRoutes($scope.routes);
                    routesTableService.updateRoutes($scope.routes);
                })
                .catch(function (error) {
                    errorService.restangularError(error);
                });
        };
	});