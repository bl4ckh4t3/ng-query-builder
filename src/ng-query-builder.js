(function () {
    'use strict';

    angular.module('ng-query-builder', ['ng-query-builder.templates']);

    angular.module('ng-query-builder').component('ngQueryBuilder', {
        "bindings": {
            "fields": "<",
            "onSearch": "&",
            "query": "=?",
            "type": "<?",
            "debugEnabled": "@?debug"
        },
        "templateUrl": 'partials/ng-query-builder.tpl.html',
        "controller": QueryBuilderController
    });

    angular.module('ng-query-builder').filter('urlEncodeFilter', urlEncodeFilter);

    function urlEncodeFilter() {
        return window.encodeURIComponent;
    }

    angular.module('ng-query-builder').filter('translate', translateFilter);

    translateFilter.$inject = ['$filter'];

    function translateFilter($filter) {
        return function (stub) {
            /*if ($filter('translate')) {
                return $filter('translate')(stub);
            }*/
            return stub;

        }
    }

    QueryBuilderController.$inject = ['$scope', '$rootScope'];

    function QueryBuilderController($scope, $rootScope) {
        var self = this;

        this.$onInit = ngOnInit.bind(this);
        this.clear = clear.bind(this);
        this.getLucene = getLucene.bind(this);
        this.hide = hide.bind(this);
        this.parseRule = parseRule.bind(this);
        this.parseChildren = parseChildre.bind(this);
        this.search = search.bind(this);

        function ngOnInit() {
            if (this.debugEnabled === undefined) {
                this.debugEnabled = false;
            }

            if (!this.type) {
                this.type = 'lucene';
            }
            if (this.debugEnabled) {
                console.log("Type selected: " + this.type);
            }
            this.clear();
            $scope.$watch(function () {
                return this.start
            }.bind(this), function (newValue) {
                self.query = this.getLucene(newValue);
            }.bind(this), true);
        }

        function getLucene(data) {

            if (!data.rules) {
                return '';
            }

            this.parts = [];
            data.rules.forEach(this.parseRule);
            data.children.forEach(this.parseChildren);

            return this.parts.join(' ');
        }

        function parseChildre(kid) {
            this.parts.push(kid.condition + ' (' + this.getLucene(kid) + ')');
        }

        function parseRule(rule, i) {
            var part = false;
            if (angular.isDefined(rule.operator)) {
                part = rule.operator[this.type];
            }

            if (part === false) {
                return;
            }

            var ope = rule.operator;
            var value = '';

            if (ope.accept_values) {
                rule.value = rule.value.slice(0, ope.accept_values);

                rule.value.forEach(function (v, i) {

                    if (i > 0) {
                        value += part.sep;
                    }
                    //Fix for enumerations with spaces.
                    /*v = v.replace(/\s/g,'\\\s');*/
                    v = v.replace(/([+&-\\\|!(){}\[\]\^\s"~*?:])/g, '\\$1');

                    if (part.fn) {
                        v = part.fn(v);
                    }
                    if (v !== '') {
                        if (!isNumber(v)) {
                            v = '"' + v + '"';
                        }
                        value += v;
                    }
                });
            }
            rule.type = rule.type || '';
            if (rule.field !== '' && (value !== '' || ope.accept_values === 0)) {
                var type = this.parts.length > 0 ? rule.type : "";
                this.parts.push(type + ' ' + part.op.replace(/\?/, value).replace(/\#/, rule.field));
            }
        }

        function isNumber(n) {
            return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
        }

        function search() {
            this.onSearch({query: this.query});
        }

        function hide() {
            this.clear();
        }

        function clear() {
            self.start = {
                "isFirst": true,
                "rules": [],
                "children": []
            };
        }
    }
})();