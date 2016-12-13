
1.0.0 / 2016-12-13
==================

* Now requires Node 4.2 or later
* Fewer dependencies
* Fixed bug where find.exec() could throw an error instead of passing it via callback/promise
* Fixed a bug that could cause date columns to be parsed with the wrong timezone.
* Pre-defined connections are now copied at instantiation instead of model definition.
* New test suite.

0.1.3 / 2016-10-27
==================

  * Fixed a bug where update and insert would pass along explicit undefined values when updating models, which then got coerced into `"undefined"`.
