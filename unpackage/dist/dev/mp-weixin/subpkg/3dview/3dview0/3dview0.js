(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["subpkg/3dview/3dview0/3dview0"],{

/***/ 74:
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
var _dview = _interopRequireDefault(__webpack_require__(/*! ./subpkg/3dview/3dview0/3dview0.vue */ 75));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_dview.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 75:
/*!****************************************************************************!*\
  !*** D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./3dview0.vue?vue&type=template&id=599697d1& */ 76);
/* harmony import */ var _3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./3dview0.vue?vue&type=script&lang=js& */ 78);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./3dview0.vue?vue&type=style&index=0&lang=css& */ 80);
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

/***/ 76:
/*!***********************************************************************************************************!*\
  !*** D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=template&id=599697d1& ***!
  \***********************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./3dview0.vue?vue&type=template&id=599697d1& */ 77);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_template_id_599697d1___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 77:
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
    aiAssistant: function () {
      return Promise.all(/*! import() | components/ai-assistant/ai-assistant */[__webpack_require__.e("common/vendor"), __webpack_require__.e("components/ai-assistant/ai-assistant")]).then(__webpack_require__.bind(null, /*! @/components/ai-assistant/ai-assistant.vue */ 151))
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

/***/ 78:
/*!*****************************************************************************************************!*\
  !*** D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./3dview0.vue?vue&type=script&lang=js& */ 79);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Editor_HBuilderx_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 79:
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=script&lang=js& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni, wx) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 44));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ 18));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 46));
var _cloud = __webpack_require__(/*! @/utils/cloud */ 47);
var AiAssistant = function AiAssistant() {
  Promise.all(/*! require.ensure | components/ai-assistant/ai-assistant */[__webpack_require__.e("common/vendor"), __webpack_require__.e("components/ai-assistant/ai-assistant")]).then((function () {
    return resolve(__webpack_require__(/*! @/components/ai-assistant/ai-assistant.vue */ 151));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var _default = {
  components: {
    AiAssistant: AiAssistant
  },
  computed: {
    frameStyle: function frameStyle() {
      return "width:".concat(this.width, "px;height:").concat(this.height, "px;");
    }
  },
  data: function data() {
    return {
      url: '',
      scale3d: '',
      position3d: '',
      width: 300,
      height: 300,
      renderWidth: 300,
      renderHeight: 300,
      isModelLoading: true,
      hasShownLoading: false,
      loadingTimer: null
    };
  },
  onLoad: function onLoad(option) {
    this.showNativeLoading();
    var windowInfo = uni.getWindowInfo();
    this.width = windowInfo.windowWidth;
    this.height = windowInfo.windowHeight;
    this.renderWidth = this.width * windowInfo.pixelRatio;
    this.renderHeight = this.height * windowInfo.pixelRatio;
    if (option && option.id) {
      this.loadModelData(option.id);
      return;
    }
    this.isModelLoading = false;
    this.hideNativeLoading();
  },
  onUnload: function onUnload() {
    this.clearLoadingTimer();
    this.hideNativeLoading();
  },
  methods: {
    showNativeLoading: function showNativeLoading() {
      if (this.hasShownLoading) {
        return;
      }
      this.hasShownLoading = true;
      uni.showLoading({
        title: '模型加载中...',
        mask: true
      });
    },
    hideNativeLoading: function hideNativeLoading() {
      if (!this.hasShownLoading) {
        return;
      }
      this.hasShownLoading = false;
      uni.hideLoading();
    },
    clearLoadingTimer: function clearLoadingTimer() {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
    },
    startLoadingGuard: function startLoadingGuard() {
      var _this = this;
      this.clearLoadingTimer();
      this.loadingTimer = setTimeout(function () {
        _this.isModelLoading = false;
        _this.hideNativeLoading();
      }, 15000);
    },
    handleModelLoaded: function handleModelLoaded() {
      this.clearLoadingTimer();
      this.isModelLoading = false;
      this.hideNativeLoading();
    },
    loadModelData: function loadModelData(id) {
      var _this2 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var db, res, data;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this2.isModelLoading = true;
                _this2.showNativeLoading();
                _this2.startLoadingGuard();
                _context.prev = 3;
                db = wx.cloud.database();
                _context.next = 7;
                return (0, _cloud.runCollectionWithFallback)([_cloud.COLLECTIONS.ARTIFACT_MODELS].concat((0, _toConsumableArray2.default)(_cloud.COLLECTION_FALLBACKS.ARTIFACT_MODELS)), function (collectionName) {
                  return db.collection(collectionName).doc(id).get();
                });
              case 7:
                res = _context.sent;
                data = res.data || {};
                _this2.url = data.modelUrl || '';
                _this2.scale3d = data.scale3d || '';
                _this2.position3d = data.position3d || '';
                _context.next = 21;
                break;
              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](3);
                _this2.clearLoadingTimer();
                _this2.isModelLoading = false;
                _this2.hideNativeLoading();
                console.error('加载 3D 模型数据失败:', _context.t0);
                uni.showToast({
                  title: '模型加载失败',
                  icon: 'none'
                });
              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[3, 14]]);
      }))();
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"]))

/***/ }),

/***/ 80:
/*!*************************************************************************************************************!*\
  !*** D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=style&index=0&lang=css& ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--6-oneOf-1-3!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Editor/HBuilderx/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./3dview0.vue?vue&type=style&index=0&lang=css& */ 81);
/* harmony import */ var _Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Editor_HBuilderx_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Editor_HBuilderx_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Editor_HBuilderx_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Editor_HBuilderx_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_3dview0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 81:
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Study/project/Zhiyun-Yi-Lacquer/subpkg/3dview/3dview0/3dview0.vue?vue&type=style&index=0&lang=css& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[74,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subpkg/3dview/3dview0/3dview0.js.map