/*
 *	DaysChart
 *	jskny
 */

 /*
  *	データ保存形式
  *
  *	[個々のポスト]
  *	text | timestamp
  *
  *	過去ログデーターベース
  *	posts	->	today		-> 0..* [個々のポスト]
  *		->	20171025	-> 0..* [個々のポスト]
  *		->	20171024	-> 0..* [個々のポスト]
  */


var pidNewPostDialog;
var module = angular.module('DaysChart', ['onsen', "ngStorage"]);

ons.ready(function() {
	// 新規追加のダイアログ設定
	ons.createPopover('template/newPostDialog.html').then(function(popover) {
		pidNewPostDialog = popover;
	});
});

module.controller('AppController', function($scope, $localStorage, $sessionStorage, $timeout) {
	// localStorage から過去ログを取得等する
	$scope.$storage = $localStorage.$default(
	[{
		"posts" : {
			"today" : []
		}
	}]);

	// 過去ログを検索し、今日と違う日付のポストがある場合、それらをまとめる。
	var dt = new Date();
	var delList = [];
	for(var i = 0; i < $scope.$storage[0]["posts"]["today"].length; i++) {
		var item = $scope.$storage[0]["posts"]["today"][i];
		var dtItem = new Date(item.ts);
		if (
			dt.getFullYear() != dtItem.getFullYear() ||
			dt.getMonth() != dtItem.getMonth() ||
			dt.getDate() != dtItem.getDate()
		) {
			var keyText = dtItem.getFullYear() + dtItem.getMonth() + dtItem.getDate();
			if ($scope.$storage[0]["posts"][keyText] == undefined) {
				$scope.$storage[0]["posts"][keyText] = [];
			}

			$scope.$storage[0]["posts"][keyText].unshift(item);
			delList.push(i);
		}
	}

	// 当日以外のを消去
	for(var i = 0; i < delList.length; i++) {
		delete $scope.$storage[0]["posts"]["today"][i];
	}


	// きれいなデータ
	$scope.todayPosts = $scope.$storage[0]["posts"]["today"];

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
			"ts" : dt.getTime()
		};

		$scope.todayPosts.unshift(data);
		// 第二引数を true にすると最新のを先頭にする、逆に false にすると最新のを後ろにする。
		$scope.todayPosts.sort(sort_by("ts", true));
		$scope.$storage[0]["posts"]["today"] = $scope.todayPosts;

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

