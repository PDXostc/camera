var templates = document.getElementById('templates').import;

function Template(id) {
  this.template = templates.getElementById(id);
  this.templateContent = document.importNode(this.template.content, true);
};

Template.prototype.addTo = function(target) {
  $(this.templateContent).appendTo(target);
};

var cameraViewDataset = function(cameraView) {
  return cameraView.templateContent.querySelector(".camera-view").dataset;
};

function setCameraDataType(cameraView, cameraType) {
  cameraViewDataset(cameraView).cameraType = cameraType;
};

function setCameraDataId(cameraView, cameraId) {
  cameraViewDataset(cameraView).cameraId = cameraId;
};

function loadCameraTitle(cameraView, options) {
  var content = cameraView.templateContent;
  content.querySelector(".camera-view .camera-title .camera-id").innerText = options.cameraId;
  content.querySelector(".camera-view .camera-title .camera-type").innerText = options.cameraType;
};

// loads any number of cameras by type. Eg. loadCameras("usb", 6);
function loadCameras(cameraType, count) {
  var targetPanelId = "#" + cameraType + "-cameras"
  var targetList = $(targetPanelId).find(".cameras-list");
  if (count > 0)
    targetList.empty();
  for (var i = 1; i <= count; i++) {
    var cameraView = new Template('camera-view-template');
    setCameraDataType(cameraView, cameraType);
    setCameraDataId(cameraView, i);
    loadCameraTitle(cameraView, {
      cameraType: cameraType,
      cameraId: i
    });
    cameraView.addTo(targetList);
  };
};

function getCameraPanelId(cameraType) {
  return cameraType + "-cameras";
};

function setActiveTab(tabID) {
  var tab = document.getElementById(tabID);
  $(tab).siblings().removeClass("active");
  $(tab).addClass("active");
};

var activeCameraNumber = function() {
	return activeCamera().dataset.cameraId;
};

function loadActiveCameraId() {
	var activeIndicator = activeCameraTab().querySelector(".active-camera-indicator");
	activeIndicator.innerText = activeCameraNumber();
};

function showActiveCameraIndicator() {
	loadActiveCameraId();
	$(activeCameraTab()).find(".active-camera-indicator").removeClass("hidden").addClass("indicator-on");
	$(activeCameraTab()).siblings().find(".active-camera-indicator").addClass("hidden").removeClass("indicator-on");
};

function scrollToPanel(panel) {
  var sliderParent = $("#cameras-slider");
  var currentPosition = sliderParent.scrollLeft();
  var panelPosition = $(panel).position().left;
  var leftScroll = currentPosition + panelPosition;
  sliderParent.animate({
    scrollLeft: leftScroll
  }, 250);
};

var activeCameraTab = function() {
	var activeTabId = activeCamera().dataset.cameraType + "-tab";
	return document.getElementById(activeTabId);
};

// tab argument is a JS object
function setActivePanel(tab) {
  var cameraType = $(tab).data("tabid");
  var camerasPanelId = getCameraPanelId(cameraType);
  $(camerasPanelId).siblings().removeClass("active");
  $(camerasPanelId).addClass("active");
  // Slides selected panel into view
  var panel = document.getElementById(camerasPanelId);
  scrollToPanel(panel);
};

// tab argument is a JS object
function switchPanels(tab) {
  setActiveTab(tab.id);
  setActivePanel(tab);
};

function touchSlidePanel() {
  var sliderParent = $("#cameras-slider");
  var panelCount = sliderParent.children().length;
  var scrollPosition = sliderParent.scrollLeft();
  var sliderWidth = sliderParent.width();
  var dominentPanelIndex = Math.round(scrollPosition / sliderWidth);
  var dominentPanel = sliderParent.children()[dominentPanelIndex];
  var tabID = dominentPanel.dataset.panelid + "-tab";

  scrollToPanel(dominentPanel);
  setActiveTab(tabID);
};

var enlargedCamera = function() {
  return document.getElementById("enlarged-view");
};

var activeCamera = function() {
  return document.querySelector(".camera-on");
};

var selectedCameraActive = function(selectedCamera) {
  var enlargedView = $("#enlarged-view").find(".camera-view");
  var typeMatch = selectedCamera.data().cameraType === enlargedView.data().cameraType;
  var idMatch = selectedCamera.data().cameraId === enlargedView.data().cameraId;
  return typeMatch && idMatch;
};

function toggleOffActive() {
  $(".camera-on").removeClass("camera-on");
};

function toggleCameras(cameras) {
  $(cameras).toggleClass("camera-on");
};

function resetMirroring() {
  $(enlargedCamera).find(".mirror-on").removeClass("mirror-on");
};

function powerCamera(camera) {
  var cameraView = $(camera).closest(".camera-view");
  var cameraScreens = generateCameraSelector(cameraView);
  if (!selectedCameraActive(cameraView)) {
    toggleOffActive();
    resetMirroring();
  };
  toggleCameras(cameraScreens);
  showActiveCameraIndicator();
};

function expandCamera(camera) {
  var cameraView = $(camera).closest(".camera-view");
  var enlargement = cameraView.clone();
  enlargement.addClass("enlarged-view");
  $("#enlarged-view .camera-view").replaceWith(enlargement);
  if (!inEnlargedView()) {
    $(".cameras-panel").addClass("panel-minimized");
    $("#enlarged-view").toggleClass("hidden");
  }
};

function contractCamera() {
	console.log("contractCamera");
  $("#enlarged-view .camera-view").empty();
  $("#enlarged-view").toggleClass("hidden");
  $(".cameras-panel").toggleClass("panel-minimized");
  switchPanels(activeCameraTab());
};

var inEnlargedView = function() {
  return window.getComputedStyle(enlargedCamera()).display !== "none";
};

function generateCameraSelector(camera) {
  var cameraData = camera.data();
  var typeFilter = "[data-camera-type='" + cameraData.cameraType + "']";
  var idFilter = "[data-camera-id='" + cameraData.cameraId + "']";
  return ".camera-view" + typeFilter + idFilter;
};

function mirrorCameraView(touchNode) {
  var cameraView = $(touchNode).closest("#enlarged-view").find(".camera-view");
  var cameras = generateCameraSelector(cameraView);
  $(cameras).find(".camera-screen").toggleClass("mirror-on");
  $(cameras).siblings().find(".camera-mirror").toggleClass("mirror-on");
};

function disableCamerasByType(type) {
  var tabId = type + "-tab";
  var camerasPanelId = getCameraPanelId(type);
  var tab = document.getElementById(tabId);
  var panel = document.getElementById(camerasPanelId);
  $(tab).addClass("disabled");
  $(panel).addClass("disabled");
};

var tempInit = function() {
  loadCameras("usb", 0);
  loadCameras("analog", 0);
  loadCameras("ip", 1);
  disableCamerasByType("usb");
  disableCamerasByType("analog");
};

$(document).ready(tempInit);

// Camera Panel Tabs 
$(document).on("click", ".slider-tab", function() {
  switchPanels(this);
});
// Camera Panel Touch Scroll
$(document).on("touchend", "#cameras-slider", function() {
  touchSlidePanel();
});
// Power Toggle
$(document).on("click", ".camera-power", function() {
  powerCamera(this);
  expandCamera(this);
});
// Removes expanded view
$(document).on("click", ".contract-icon", function() {
  contractCamera();
});
// Mirroring
$(document).on("click", ".camera-mirror", function() {
  mirrorCameraView(this);
});
// Expand camera view
$(document).on("click", ".camera-expand", function() {
  expandCamera(this);
});

// EOF
