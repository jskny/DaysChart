/*
 *	DaysChart
 *	jskny
 */

 /*
  *	データ保存形式
  *
  *	[個々のポスト]
  *	text | ts(timestamp)
  *
  *	個別振り分け前のポストデータを入れるところ
  *	today		-> 0..* [個々のポスト]
  *
  *	過去ログデーターベース
  *	db	->	"2017/10/25"	-> 0..* [個々のポスト]
  *		->	"2017/10/24"	-> 0..* [個々のポスト]
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
		"today" : [],
		"db" : {
		}
	}]);

	// 過去ログを検索し、今日と違う日付のポストがある場合、それらをまとめる。
	var dt = new Date();
	var delList = [];
	for(var i = 0; i < $scope.$storage[0]["today"].length; i++) {
		var item = $scope.$storage[0]["today"][i];
		if (item == null) {
			delList.push(i);
			continue;
		}


		var dtItem = new Date(item.ts);
		if (
			dt.getFullYear() != dtItem.getFullYear() ||
			dt.getMonth() != dtItem.getMonth() ||
			dt.getDate() != dtItem.getDate()
		) {
			var keyText = String(dtItem.getFullYear()) + "/" + String(dtItem.getMonth()) + "/" + String(dtItem.getDate());
			if ($scope.$storage[0]["db"][keyText] == undefined) {
				$scope.$storage[0]["db"][keyText] = [];
			}

			$scope.$storage[0]["db"][keyText].unshift(item);
			delList.push(i);
		}
	}


	// 今日のではない要素を除去
	$scope.$storage[0]["today"] = DelArrayItem($scope.$storage[0]["today"], delList);
	// db 要素数
	$scope.dbPostListNum = Object.keys($scope.$storage[0]['db']).length;

	// きれいなデータ
	// Javascript では配列のコピーで = を使うと下の配列への参照を返すのみなので concat でコピーオブジェクトを作成する。
	$scope.todayPosts = $scope.$storage[0]["today"].concat();

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
		$scope.$storage[0]["today"] = $scope.todayPosts;

		document.getElementById("newPostText").value = "";

		$scope.hideNewPostDialog();

		// 強制的に Angular のビューを再構築する
		location.reload();
	};
});


//-------------------------------------


// 特定の要素を splite で消す
function DelArrayItem(org, delList) {
	var retArray = org.concat();

	// 使用しないのを delete ( 当該要素は null になる )
	for(var i = 0; i < delList.length; ++i) {
		delete retArray[delList[i]];
	}

	for (var i = 0; i < delList.length; ++i) {
		for (var j = 0; j < retArray.length; ++j) {
			if (retArray[j] == null) {
				retArray.splice(j, 1);
				break;
			}
		}
	}

	return (retArray);
}


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

