module.exports = ngModule => {
  ngModule.directive('formlyCustomValidation', function (formlyUtil, $q) {

    return {
      require: 'ngModel',
      link: function (scope, el, attrs, ctrl) {
        var validators = scope.$eval(attrs.formlyCustomValidation);
        if (!validators) {
          return;
        }

        // setup watchers and parsers
        var hasValidators = ctrl.hasOwnProperty('$validators');
        angular.forEach(validators, function (validator, name) {
          if (hasValidators) {
            var isPossiblyAsync = !angular.isString(validator);
            var validatorCollection = isPossiblyAsync ? '$asyncValidators' : '$validators';
            ctrl[validatorCollection][name] = function (modelValue, viewValue) {
              var value = formlyUtil.formlyEval(scope, validator, modelValue, viewValue);
              if (isPossiblyAsync) {
                return isPromiseLike(value) ? value : value ? $q.when(value) : $q.reject(value);
              } else {
                return value;
              }
            };
          } else {
            ctrl.$parsers.unshift(function (viewValue) {
              var isValid = formlyUtil.formlyEval(scope, validator, ctrl.$modelValue, viewValue);
              ctrl.$setValidity(name, isValid);
              return viewValue;
            });
          }
        });
      }
    };
    function isPromiseLike(obj) {
      return obj && angular.isFunction(obj.then);
    }
  });
};
