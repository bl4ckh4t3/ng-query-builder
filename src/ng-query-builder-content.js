(function () {
    'use strict';

    angular.module('ng-query-builder').component('ngQueryBuilderContent', {
        "templateUrl": 'partials/ng-query-builder-content.tpl.html',
        "controller": QueryBuilderContentController,
        "bindings": {
            "group": '=',
            "fields": '<',
            "parent": '=?',
            "query": '='
        }
    });

    function QueryBuilderContentController($scope) {

        this.$onInit = ngOnInit.bind(this);
        this.addGroup = addGroup.bind(this);
        this.addRule = addRule.bind(this);
        this.getRuleParams = getRuleParams.bind(this);
        this.removeCondition = removeCondition.bind(this);
        this.removeGroup = removeGroup.bind(this);
        this.selectedField = selectedField.bind(this);

        this.conditions = ['AND', 'OR'];
        this.operators = [
            {
                "type": 'equal',
                "lucene": {
                    "op": '#:?'
                },
                "accept_values": 1,
                "apply_to": ['string', 'number',
                    'datetime', 'boolean']
            },
            {
                "type": 'not_equal',
                "lucene": {
                    "op": '(*:* AND -#:?)'
                },
                "accept_values": 1,
                "apply_to": ['string', 'number',
                    'datetime', 'boolean']
            },
            {
                "type": 'like',
                "lucene": {
                    "op": '#:*?*'
                },
                "accept_values": 1,
                "apply_to": ['string', 'number', 'datetime', 'boolean']
            }, {
                type: 'not_like',
                lucene: {
                    op: '(*:* AND -#:*?*)'
                },
                accept_values: 1,
                apply_to: ['string', 'number', 'datetime', 'boolean']
            }, {
                type: 'between',
                lucene: {
                    op: '#:[?]',
                    list: true,
                    sep: ' TO '
                },
                accept_values: 2,
                apply_to: ['number', 'datetime']
            }, {
                type: 'between_not_inclusive',
                lucene: {
                    op: '#:{?}',
                    list: true,
                    sep: ' TO '
                },
                accept_values: 2,
                apply_to: ['number', 'datetime']
            }, {
                "type": 'not_null',
                "lucene": {
                    "op": '#:*'
                },
                "accept_values": 0,
                "apply_to": ['string', 'number',
                    'datetime', 'boolean']
            },
            {
                "type": 'null',
                "lucene": {
                    "op": '(*:* AND -#:*)'
                },
                "accept_values": 0,
                "apply_to": ['string', 'number',
                    'datetime', 'boolean']
            }];


        var default_operator = this.operators[0];
        var default_condition = this.conditions[0];

        function ngOnInit() {
            if (this.group.rules.length === 0) {
                this.addRule();
            }
        }

        function addRule() {
            var newCondition = {
                "operator": default_operator,
                "field": '',
                "value": []
            };
            if (this.group.rules.length > 0) {
                newCondition.type = default_condition;
            }
            this.group.rules.push(newCondition);
        }

        function removeCondition(index) {
            this.group.rules.splice(index, 1);
            if (this.group.rules.length === 0) {
                this.addRule();
            }
            this.group.rules[0].type = '';
        }

        function addGroup() {
            var newGroup = {
                "condition": default_condition,
                "rules": [],
                "children": []
            };
            this.group.children.push(newGroup);
        }

        function removeGroup(index) {
            this.parent.children.splice(index, 1);
        }


        function selectedField(rule) {
            rule.value = [];
            rule.operator = default_operator;
        }


        function getRuleParams(rule) {
            if (rule.operator) {
                return new Array(rule.operator.accept_values);
            }
            return new Array(1);
        }

    }
})();