﻿/*
 *	DaysChart
 *	jskny
 */

var pidNewPostDialog;
var module = angular.module('DaysChart', ['onsen']);

ons.ready(function() {
	// 新規追加のダイアログ設定
	ons.createPopover('template/newPostDialog.html').then(function(popover) {
		pidNewPostDialog = popover;
	});
});

module.controller('AppController', function($scope, $timeout) {
	$scope.todayPosts = [];


	$scope.showNewPostDialog = function() {
		pidNewPostDialog.show("#btNewPostDialog");
	};
	$scope.hideNewPostDialog = function() {
		pidNewPostDialog.hide();
	};

	// 新規追加
	$scope.addTodayPost = function() {
		var text = document.getElementById("newPostText").value;
		if (text.length <= 0) {
			$scope.hideNewPostDialog();
			ons.notification.alert("Message is unjust.");
			return;
		}

		if (text.length > 200) {
			$scope.hideNewPostDialog();
			ons.notification.alert("Message over 200 char.");
			return;
		}

		// 時刻記載
		var dt = new Date();
		var data = {
			"text" : text,
			"timestamp" : dt.getTime()
		};

		$scope.todayPosts.unshift(data);
		// 第二引数を true にすると最新のを先頭にする、逆に false にすると最新のを後ろにする。
		$scope.todayPosts.sort(sort_by("timestamp", true));
		document.getElementById("newPostText").value = "";
		$scope.hideNewPostDialog();
	};
});


//-------------------------------------


// json オブジェクトをソートするコード
// from : http://www.koikikukan.com/archives/2011/04/05-025555.php
// example : data.sort(sort_by('id', false, function(a){return a.toUpperCase()}));
var sort_by = function(field, reverse, primer) {
	reverse = (reverse) ? -1 : 1;
	return function(a, b) {
		a = a[field];
		b = b[field];

		if (typeof(primer) != 'undefined'){
			a = primer(a);
			b = primer(b);
		}
		if (a<b) return reverse * -1;
		if (a>b) return reverse * 1;
		return 0;
	}
}

