(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["subpkg/3dview/3dview0/3dview0"],{

/***/ 103:
/*!*************************************************************************************************!*\
  !*** D:/Study/project/Zhiyun-Yi-Lacquer/main.js?{"page":"subpkg%2F3dview%2F3dview0%2F3dview0"} ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 26);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _dview = _interopRequireDefault(__webpack_require__(/*! ./subpkg/3dview/3dview0/3dview0.vue */ 104));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_dview.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 104:
/*!****************************************************************************!*\
  !*** D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./3dview0.vue?vue&type=template&id=599697d1& */ 105);
/* harmony import */ var _3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./3dview0.vue?vue&type=script&lang=js& */ 107);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./3dview0.vue?vue&type=style&index=0&lang=css& */ 109);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 32);

var renderjs





/* normalize component */

var component = Object(_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["render"],
  _3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null,
  false,
  _3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "subpkg/3dview/3dview0/3dview0.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 105:
/*!***********************************************************************************************************!*\
  !*** D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=template&id=599697d1& ***!
  \***********************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./3dview0.vue?vue&type=template&id=599697d1& */ 106);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 106:
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=template&id=599697d1& ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
try {
  components = {
    aifunction: function () {
      return Promise.all(/*! import() | components/aifunction/aifunction */[__webpack_require__.e("common/vendor"), __webpack_require__.e("components/aifunction/aifunction")]).then(__webpack_require__.bind(null, /*! @/components/aifunction/aifunction.vue */ 187))
    },
  }
} catch (e) {
  if (
    e.message.indexOf("Cannot find module") !== -1 &&
    e.message.indexOf(".vue") !== -1
  ) {
    console.error(e.message)
    console.error("1. 排查组件名称拼写是否正确")
    console.error(
      "2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"
    )
    console.error(
      "3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件"
    )
  } else {
    throw e
  }
}
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 107:
/*!*****************************************************************************************************!*\
  !*** D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./3dview0.vue?vue&type=script&lang=js& */ 108);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 108:
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=script&lang=js& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni, wx) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var _default = {
  data: function data() {
    return {
      // 默认 3D 模型 URL，后续会被数据库中的 modelUrl 覆盖
      url: "",
      // 默认 3D 模型缩放和位置，后续会被数据库中的 scale3d / position3d 覆盖
      // 这里不再给固定默认值，全部依赖数据库字段
      scale3d: '',
      position3d: '',
      width: 300,
      height: 300,
      renderWidth: 300,
      renderHeight: 300
    };
  },
  onLoad: function onLoad(option) {
    uni.showLoading({
      title: '模型加载中...'
    });
    this.width = uni.getWindowInfo().windowWidth;
    this.height = uni.getWindowInfo().windowHeight;
    var dpi = uni.getWindowInfo().pixelRatio;
    this.renderWidth = this.width * dpi;
    this.renderHeight = this.height * dpi;
    // 根据传入的 id 从 3dview 集合加载模型配置
    if (option && option.id) {
      this.loadModelData(option.id);
    } else {
      // 没有传 id 时，直接关闭加载提示，使用默认配置
      uni.hideLoading();
    }
  },
  methods: {
    loadModelData: function loadModelData(id) {
      var _this = this;
      var db = wx.cloud.database();
      db.collection('3dview').doc(id).get().then(function (res) {
        var data = res.data || {};
        if (data.modelUrl) {
          _this.url = data.modelUrl;
        }
        if (data.scale3d) {
          _this.scale3d = data.scale3d;
        }
        if (data.position3d) {
          _this.position3d = data.position3d;
        }
      }).catch(function (err) {
        console.error('加载3D模型数据失败', err);
        uni.hideLoading();
        uni.showToast({
          title: '模型加载失败',
          icon: 'none',
          duration: 1500
        });
      });
    },
    handleReady: function handleReady() {
      uni.hideLoading();
    },
    handleGLTFLoaded: function handleGLTFLoaded() {
      console.log('模型加载完成');
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"]))

/***/ }),

/***/ 109:
/*!*************************************************************************************************************!*\
  !*** D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=style&index=0&lang=css& ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--6-oneOf-1-3!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./3dview0.vue?vue&type=style&index=0&lang=css& */ 110);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 110:
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=style&index=0&lang=css& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[103,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subpkg/3dview/3dview0/3dview0.js.map