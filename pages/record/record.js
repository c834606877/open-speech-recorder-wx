// pages/record/record.js

//var p5 = require("../../utils/p5.min.js")

const app = getApp()

const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
const options = {
  duration: 60000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 96000,
  format: 'mp3',
  frameSize: 1
};
var savedFilePath;
var RecordStatus;
var wantedWords = [
  { word: '小鹿小鹿', ename: 'xiaoluxiaolu', count: 3 },
  { word: '开始', ename: 'start', count: 2 },
  { word: '结束', ename: 'end', count: 2 },
  { word: '向前', ename: 'forward',count: 1 },
  { word: '向后', ename: 'behind', count: 1 },
  { word: '向左', ename: 'left', count: 1 },
  { word: '向右', ename: 'right', count: 1 },
  { word: '确认', ename: 'confirm', count: 1 },
  { word: '取消', ename: 'cancel', count: 2 },
  { word: '暂停', ename: 'pause', count: 2 },
];
var iCurrentWord = 0;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    btn_touch_text: "长按录制",
    current_word: "",
    btn_start_enable: "",
    btn_stop_enable: "none",
    btn_upload_enable: "",
    last_words_cnt: "17"
  
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({ current_word: wantedWords[iCurrentWord].word });
    this.setData({ last_words_cnt: this.GetWordsCnt()});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var _this = this;


    recorderManager.onStop((res) => {
      wx.showToast({
        title: "成功，正在上传。",
        icon: "success"
      })
      console.log('recorder stop')
      var tmpFilePath = res.tempFilePath;
      wx.saveFile({
        tempFilePath: tmpFilePath,
        success: function (res) {
          savedFilePath = res.savedFilePath;
          console.log(res);
          wx.uploadFile({
            url: 'https://osr.emlab.net/upload_mp3',
            filePath: savedFilePath,
            name: 'file',
            header: {},
            formData: {
              word: wantedWords[iCurrentWord].ename,
              session_id: app.globalData.uid
            },
            success: function (res) {
              console.log(res);
              console.log("Upload ok");
            },
            fail: function (res) {
              console.log("Upload fail");
            },
            complete: function (res) {
              console.log("Upload complete");
            },
          })

        },
        fail: function (res) { },
        complete: function (res) {
          if (wantedWords[iCurrentWord].count > 0) {
            wantedWords[iCurrentWord].count--;
          };
          iCurrentWord = _this.GetWord()
          if (iCurrentWord < 0) {
            _this.setData({ btn_record_text : "录制完成" });
          }
          else{
            _this.setData({ current_word: wantedWords[iCurrentWord].word });
          }
          


        },
      })
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  stopRecord: function(e) {
    RecordStatus = 'off'
    this.setData({btn_start_enable : ""});
    this.setData({ btn_stop_enable: "none" });
    this.setData({ btn_upload_enable: "" });
    this.setData({ current_word: "开始后，请立即读出显示的单词" });

  },

  startRecord: function(e) {
    RecordStatus = "on";
    this.setData({ btn_start_enable: "none" });
    this.setData({ btn_stop_enable: "" });
    for (var i = 0; i < wantedWords.length; i++) {
      wantedWords[i].count = 2;

    }
    //this.RecordWord();
    
    
    
  },
  GetWordsCnt: function(){
    var cnt=0;
    for (var i = 0; i < wantedWords.length; i++) {
      if (wantedWords[i].count > 0) {
        cnt += wantedWords[i].count;
      }
    }
    return cnt;
  },
  GetWord: function(){
    this.setData({last_words_cnt: this.GetWordsCnt()});
    console.log(wantedWords.length);
    var r = Math.floor(Math.random() * (wantedWords.length))
    for(var i=r; i < wantedWords.length; i++)
    {
      if(wantedWords[i].count > 0)
      {
        return i;
      }
    }
    for (var i = 0; i < r; i++) {
      if (wantedWords[i].count > 0) {
        return i;
      }
    }
    return -1;
  },
  RecordWord: function()
  {
    let i = this.GetWord();
    if(i == -1 ){
      console.log("no more word!");
      wx.showToast({
        title: "录制结束，数据已上传",
        icon: "success"
      })
      this.setData({ current_word: "录制完成！" });
      return;
    }
    
    console.log(wantedWords[i]);
    console.log("start record word: " + wantedWords[i].word);
    this.setData({ current_word: wantedWords[i].word });



  },
  uploadRecord: function(e)
  {
    console.log(e);
    console.log("uploadRecord btn tap");
    console.log(savedFilePath);
    this.playRecord(e);
    
  },
  playRecord: function(e)
  {
    innerAudioContext.autoplay = true;
    innerAudioContext.src = savedFilePath;


      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  touchstart: function(e)
  {
    this.setData({ btn_touch_text : "录音中" });
    recorderManager.start(options);
    var _this = this;

    setTimeout(function () {
      _this.touchend(e)

    }, 10000);
  },
  touchend: function(e)
  {
    recorderManager.stop();
    this.setData({ btn_touch_text: "长按录制" });
  }


  
})