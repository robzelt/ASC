﻿(function () {
    'use strict';

    angular.module('ascApp').controller('AssignBlueprintCtrl', AssignBlueprintCtrl);
    AssignBlueprintCtrl.$inject = ['initialData', 'ascApi', 'toastr'];

    /* @ngInject */
    function AssignBlueprintCtrl(initialData, ascApi, toastr) {
        /* jshint validthis: true */
        var vm = this;
        vm.assignmentName = "";
        vm.blueprintVersion = null;

        vm.lodash = _;
        vm.parameters = [];
        vm.resourceGroups = [];
        vm.blueprintDefinitionVersion = initialData.name;
        vm.blueprintName = initialData.properties.blueprintName;
        vm.assignmentName = 'Assignment-' + vm.blueprintName;
        vm.targetScope = initialData.properties.targetScope;
        vm.location = 'eastus';
        vm.lockedAssigment = 'DontLock';
        vm.blueprintResourceNamePrefix = "";
        vm.assign = assign;

        activate();

        function activate() {
            vm.blueprintVersion = initialData;
            var tempArr = vm.blueprintVersion.id.split('/');
            var subscriptionsIndex = tempArr.indexOf('subscriptions');
            vm.subscriptionId = tempArr[subscriptionsIndex + 1];

            _.forIn(initialData.properties.parameters, function (value, key) {
                vm.parameters.push({ name: key, info: value, value: value.defaultValue });
            });

            _.forIn(initialData.properties.resourceGroups, function (value, key) {
                var resourceGroupInfo = value;
                var newRgObj = {
                    "key": key,
                    "displayName": resourceGroupInfo.metadata.displayName,
                    "dependsOn": resourceGroupInfo.dependsOn
                };
                if (typeof resourceGroupInfo.location !== "undefined") {
                    newRgObj.location = resourceGroupInfo.location;
                }
                if (typeof resourceGroupInfo.name !== "undefined") {
                    newRgObj.name = resourceGroupInfo.name;
                }
                vm.resourceGroups.push(newRgObj);
            });

            console.log('vm.resourceGroups');
            console.log(vm.resourceGroups);

            console.log('vm.parameters');
            console.log(vm.parameters);
        }

        function assign() {
            var blueprintAssignment = {
                "identity": {
                    "type": "SystemAssigned"
                },
                "location": vm.location,
                "properties": {
                    "blueprintId": "/subscriptions/c4ffd701-5227-4ce4-9b22-e87c75fd788b/providers/Microsoft.Blueprint/blueprints/jagrati-devtest2/versions/1.0",
                    "locks": {
                        "mode": "none"
                    }
                }
            };
            var parameters = {};
            var resourceGroups = {};

            _.forIn(vm.parameters, function (objValue, key) {
                parameters[`${objValue.name}`] = {
                    "value": objValue.value
                }
            });
            blueprintAssignment.properties['parameters'] = parameters;

            _.forIn(initialData.properties.resourceGroups, function (objValue, key) {
                if (typeof objValue.name == "undefined" || typeof objValue.location == "undefined") {
                    resourceGroups[`${key}`] = {};
                    var matchingRg = vm.resourceGroups.find(i => i.key === key);
                    //If name is not assigned in blueprint definition, add name property
                    if (typeof objValue.name == "undefined") {
                        resourceGroups[`${key}`]["name"] = matchingRg.name;
                    }
                    //If location is not assigned in blueprint definition, add location property
                    if (typeof objValue.location == "undefined") {
                        resourceGroups[`${key}`]["location"] = matchingRg.location;
                    }
                }
            });
            blueprintAssignment.properties['resourceGroups'] = resourceGroups;
            console.log(blueprintAssignment);
            ascApi.assignBlueprint(vm.subscriptionId, vm.assignmentName, blueprintAssignment).then(function (data) {
                if (data.error) {
                    console.log('Error while assigning blueprint!', data);
                    toastr.error('Unexpected error while assigning.', 'Error');
                } else {
                    //vm.policy = data.policy;
                    toastr.success('Blueprint assigned successfully.', 'Success');
                }
            });
        }
    }
}
)();