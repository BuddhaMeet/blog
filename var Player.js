var Player = {
        playList: [{ title: "天空之城", singer: "久石讓", URL: ["http://upload20.music.qzone.soso.com/30479511.mp3","http://landodesign.net /sky.mp3"]},
                        {title: "金魚的眼淚", singer: "紀佳松", URL: ["http://wma.9ku.com/2011/3/26/1.mp3"]}],//播放列表數據
        currentSong: {},//當前播放歌曲
        audio: document.getElementById("audio"),//綁定頁面相應的Dom，下面幾個都是
        list: document.getElementById("playlist"),
        sea​​rch: document.getElementById("btn"),
        keyword: document.getElementById("search"),
        state: document.getElementById("state"),
        init: function () {//初始化函數
            this.renderList();//渲染播放列表
            var self=this;
            this.search.onclick = function () { Player.add(self.keyword.value); }//綁定點擊搜索歌曲的按鈕
        },
        add: function (keyword) {//添加歌曲函數，參數是關鍵字
            var self = this;
            this.search.innerHTML = "我挖啊挖...";
            var xhr = new XMLHttpRequest();//初始化XHR對象，下面是發送數據和​​一些準備工作
            xhr.open("GET", "info2.ashx?keyword=" + window.escape(keyword), true);
            xhr.onreadystatechange = function () { if (xhr.readyState == 4) callback(xhr.responseText); }
            xhr.send(null);
            function callback(data) {//回調函數
                if (data) {//如果有數據傳回來
                    var obj = eval(data);//解析為對象並且push進播放列表中
                    self.playList.push(obj);
                    self.renderList();//渲染列表
                    if(self.audio.src==""||self.audio.ended)self.play(obj);//如果是之前沒有播放或者已經結束了，就直接播放搜索出來的那首歌
                }
                else {//如果搜不到或者出錯都會返回空字符串，然後會有這個提示
                    alert("木有這首歌啵~");
                }
                self.search.innerHTML = "再來一首吧";
            }
        },
        play: function (song) {
            var self = this;
            this.audio.src = song.URL[0];//把第一個URL賦給audio
            this.audio.addEventListener("error", function () {//如果出錯了並且有兩個URL，就嘗試第二個；下面是都各種事件的綁定
                if (self.audio.src == song.URL[0] && song.URL[1]) self.audio.src = song.URL[1];
                else self.changeState("鏈接失敗！");
            });
            this.audio.addEventListener("waiting", function () {
                self.changeState("等待緩衝...");
            });
            this.audio.addEventListener("playing", function () {
                self.changeState("正在播放:" + song.title + " - " + song.singer, "正在播放:" + song.title);
            });
            this.audio.addEventListener("pause", function () {
                self.changeState("暫停播放:" + song.title + " - " + song.singer, "正在播放:" + song.title);
            });
            this.audio.addEventListener("ended", function () {//如果播放完了，就隨機播放下一首，不知道是不是算法有問題，感覺很不隨機
                self.play(self.playList[Math.ceil(self.playList.length * Math.random()) - 1]);
            });
            this.audio.play();//播放
            this.currentSong = song;
            this.renderList();
        },
        renderList: function () {//渲染列表函數
            var self = this;
            this.list.innerHTML = "";//先清空Dom
            for (var i = 0; i < this.playList.length; i++) {//一個個的節點加上去
                var a = document.createElement("a");
                if (this.playList[i] == self.currentSong) a.setAttribute("class", "playing");
                a.innerHTML = this.playList[i].title + " - " + this.playList[i].singer //+ (this.playList[i] == self.currentSong ? "   [正在播放...] " : "");
                a.href = "javascript:void(0)";
                a.onclick = (function (song) {//這裡要創建閉包
                    return function () {
                        self.play(song);
                    }
                })(this.playList[i]);
                this.list.appendChild(a);
            }
        },
        changeState: function (info, title) {//改變狀態函數
            this.state.innerHTML = info;//這個是控制欄上面的哪裡
            document.title = title || info;//這個是網頁標題，如果沒有第二參數則使用前一個參數
        }
    }
    window.onload = Player.init();
