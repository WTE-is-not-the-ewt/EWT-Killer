// ==UserScript==
// @name         EWT Killer Box
// @namespace    EWTKILL
// @version      RELEASE 1.573
// @description  在使用之前,作者先劝各位学兄/弟们提个醒:能认真学习的尽量认真学习,只有认真学习才能获得一个好成绩!至于有什么功能？你用了就知道啦!(WTE版补充：由于使用此项目造成的一切后果，与项目的任何参与者无关且任何参与者均不知情。此项目的任何参与者不对项目的安全性做出保证并无意违反使用地的任何法律法规。使用此项目即代表使用者知情且同意以上内容。此项目不得售卖。)
// @author       Sudo-su-Bash , 并且由WTE精简
// @connect      *
// @license      GPL2
// @match        https://web.ewt360.com/mystudy/
// @match        https://teacher.ewt360.com/ewtbend/bend/index/index.html
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/crypto-js/4.1.1/core.js
// @require      https://cdn.bootcdn.net/ajax/libs/crypto-js/4.1.1/hmac.js
// @require      https://cdn.bootcdn.net/ajax/libs/crypto-js/4.1.1/sha1.js
// ==/UserScript==

//从此版本起采用全新版本号规则
//1.abc a:功能性更新代号 b:bug修复数量 c:ui更新/细节更新

const GET_USER_URL =
  "https://gateway.ewt360.com/api/usercenter/user/login/getUser?platform=1";
const DAY_URL =
  "https://gateway.ewt360.com/api/homeworkprod/homework/student/studentHomeworkDistribution";
const HOMEWORK_URL =
  "https://gateway.ewt360.com/api/homeworkprod/homework/student/getStudentHomeworkInfo";
const SCHOOL_URL =
  "https://gateway.ewt360.com/api/eteacherproduct/school/getSchoolUserInfo";
const COURSE_URL =
  "https://gateway.ewt360.com/api/homeworkprod/homework/student/pageHomeworkTasks";
const GET_LESSON_DETAIL_URL =
  "https://gateway.ewt360.com/api/homeworkprod/player/getLessonDetailV2";
const LESSON_HOMEWORK_URL =
  "https://gateway.ewt360.com/api/homeworkprod/player/getPlayerLessonConfig";
const HOMEWORK_DOING_URL =
  "https://web.ewt360.com/mystudy/#/exam/answer/?paperId={%s}&bizCode=204&platform=1";
const COURSE_BATCH_URL = "https://bfe.ewt360.com/monitor/web/collect/batch";
const HMAC_SECRET_ID_URL =
  "http://bfe.ewt360.com/monitor/hmacSecret?userId={%s}";
const HOMEWORK_GET_ANSWER_URL =
  "https://web.ewt360.com/customerApi/api/studyprod/web/answer/webreport?reportId={reportid}&bizCode={bizCode}";
const HOMEWORK_INFO_URL =
  "https://web.ewt360.com/customerApi/api/studyprod/web/answer/report?&platform=1&isRepeat=1&paperId={paperId}&bizCode={bizCode}";
const SUBMIT_ANSWER_URL =
  "https://web.ewt360.com/customerApi/api/studyprod/web/answer/submitanswer";
const MISSION_INFO_URL =
  "https://gateway.ewt360.com/api/homeworkprod/homework/student/studentHomeworkSummaryInfo?sceneId=0&homeworkId={hid}&schoolId={sid}";

let header = {
  Origin: "https://web.ewt360.com",
  Referer: "https://web.ewt360.com/mystudy/",
};

let headerCourse = {
  Origin: "https://teacher.ewt360.com",
  Referer: "https://teacher.ewt360.com/",
  Referurl:
    "https://teacher.ewt360.com/ewtbend/bend/index/index.html#/homework/play-videos",
};

let headerCourseWithToken = headerCourse;

let headerJump = {
  Origin: "https://teacher.ewt360.com",
  Referer: "https://teacher.ewt360.com/",
  Host: "bfe.ewt360.com",
  "Accept-Encoding": "gzip,deflate,br",
  Accept: "*/*",
  "Content-Type": "application/json; charset=utf-8",
};

let style = `
#close-btn {
    font-size: 12px;
    height: 16px;
    width: 16px;
    border-radius: calc(50%);
    background-color: red;
    margin-right: 0;
    font-weight: bolder;
    display: flex;
    align-items: center;
    justify-content: center;
}

#close-btn:hover > .close-btn-label {
    display: flex;
    align-items: center;
    justify-content: center;
}

#close-btn > .close-btn-label {
    display: none;
}

.kewt-tscol-right {
    margin-left: auto;
    margin-right:5px;
    text-align: right;
}

#window-main {
    border-radius: 10px;
    width: 600px;
    max-height: 600px;
    opacity: 0;
    margin-bottom: 100px;
    background-color: white;
    position: relative;
}

#window-bg {
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background-color:rgb(128,128,128,0.6);
    z-index:99;
    display:flex;
    align-items: center;
    justify-content: center;
}

.kewt-course-text,.kewt-homework-text {
    font-size: 25px;
    font-weight: bolder;
}

.kewt-window-nav {
    position: relative;
    width:100%;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 5px;
    padding-bottom: 0;
    display: flex;
    align-items: center;
}

.kewt-tscol {
    line-height: 14px;
}

.kewt-subject {
    font-size: 12px;
    color:gray;
    scale: 0.9;
    transform-origin: 0 100%;
}

.kewt-subject-right {
    transform-origin: 100% 50%;
}

.kewt-title {
    font-weight: bolder;
}

.kewt-window-body {
    width:100%;
    padding:10px;
    overflow-y: auto;
}

.kewt-subject {
    font-size:12px;
}

.kewt-course-detail,.kewt-homework-detail {
    line-height: 15px;
    margin-top: 1px;
}

.kewt-course-col,.kewt-homework-col {
    color: #666;
    scale:0.85;
    transform-origin: 0 50%;
}

.kewt-course-funcbtns {
    margin-top: 5px;
    display: flex;
    align-items: cent6er;
}

.kewt-common-btn {
    font-size: 12px;
    padding: 5px 15px;
    background-color: #ca0404;
    color: white;
    border-radius: 5px;
    transition: background-color 200ms;
    margin-right: 20px;
    box-shadow: 0 0 5px gray;
    display: inline-block;
}

.kewt-course-top,.kewt-homework-top {
    margin-top: 7px;
}

.kewt-log-box {
    width: 100%;
    padding: 7px;
    border-radius: 5px;
    line-height: 15px;
    font-size: 12px;
    box-shadow: 0 0 5px black;
    overflow-y: auto;
}

#kewt-logbox-0 {
    margin-top: 10px;
}

.btn-red {
    background-color: #ca0404;
    color:white;
}

.btn-red:hover {
    background-color: #a20101;
}

.btn-green {
    color: white;
    background-color: green;
}

.btn-green:hover {
    background-color: #025c02;
}

.btn-yellow {
    background-color: orange;
}

.btn-yellow:hover {
    background-color: #b97800;
}

.btn-unclick {
    background-color: gray;
}

.kewt-course-container {
    margin-top:5px;
    height:200px;
    display:flex;
}

.kewt-course-c-left {
    width:25%;
    border-radius: 5px;
    background-color: rgba(0,0,0,0);
    box-shadow: 0 0 5px 1px gray;
    box-sizing: border-box;
    padding:10px 0;
    margin-right: 10px;
    overflow-y: auto;
}

.kewt-course-c-right {
    flex: 1;
    box-shadow: 0 0 5px 1px gray;
    border-radius: 5px;
    overflow-y:auto;
    box-sizing: border-box;
    padding:5px;
}

.kewt-course-l-date {
    padding:5px;
    width:100%;
    font-weight:bolder;
}

.kewt-course-l-date-sel {
    background-color: #0aa5ff;
    color:white;
}

.kewt-course-c-right-ele {
    display: flex;
    padding: 5px;
    margin-bottom: 3px;
    width:100%;
    background-color: #87838365;
    border-radius: 5px;
    transition: background-color 200ms;
    box-sizing:border-box;
}

.kewt-course-c-right-ele:hover {
    background-color: #6b5a5a65;
}

.kewt-cci-i {
    width:70px;
    height:45px;
}

.kewt-cci-title {
    font-size: 13px;
    font-weight:bolder;
}

.kewt-course-c-info {
    margin-left: 5px;
    display:flex;
    flex-direction: column;
    flex: 1;
}

.kewt-course-c-major {
    margin-top: 3px;
    flex: 1;
    display: flex;
}

.kewt-mission-fn-btn {
    color:white;
    padding: 5px 10px;
    display: inline-block;
    border-radius: 5px;
    font-size: 12px;
    margin-top: auto;
    margin-bottom: 0;
    margin-left: auto;
    margin-right:0;
    scale: 0.75;
    transform-origin: 100% 100%;
}

.kewt-course-wfunc {
    margin-top: 5px;
    display: flex;
}

.kewt-cci-id {
    margin-top: 5px;
    font-size:12px;
    scale:0.9;
    transform-origin: 0% 50%;
    color: gray;
}

.kewt-course-c-img {
    display:flex;
    align-items: center;
    justify-content: center;
}

.kewt-homework-container {
    margin-top: 5px;
    max-height: 350px;
    border-radius: 5px;
    box-shadow:0 0 5px 1px gray;
    padding: 5px;
    box-sizing: border-box;
    overflow-y: auto;
}

.kewt-ques-container,.ques-answer-container {
    padding: 5px;
    box-shadow: border-box;
    box-shadow:0 0 3px 1px gray;
}

.ques-answer-container {
    margin-top: 10px;
}

.kewt-ques-container {
    margin-bottom: 10px;
}

.ques-status-bar {
    display: flex;
    width: 100%;
    align-items: center;
}

.ques-c-info {
    margin-left: 7px;
}

.orange-container,.red-container,.blue-container {
    height:15px;
    border-radius: 8px;
    font-size: 12px;
    color: white;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.orange-container {
    background-color: orange;
}

.red-container {
    background-color: #d52727;
}

.blue-container {
    background-color: #00ff9db0;
    color: black;
}

.ques-options-choice-dot,.ques-options-choice-dot-heart{
    height: 25px;
    width: 25px;
    border-radius: 50%;
    font-size: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid purple;
}

.ques-options-choice-dot-heart {
    background-color: purple;
    font-weight: bolder;
    color: white;
}

.ques-option-content {
    margin-left: 4px;
}

.ques-options-option {
    padding: 3px;
    margin: 2px 0;
    border: 1px solid black;
    border-radius: 5px;
    display: flex;
    align-items: center;
}

.ques-answer-parse {
}

.ques-opt-container {
    font-size: 20px;
    font-weight: bolder;
}

.ques-parse-container {
    font-size: 12px;
    line-height: 15px;
}
`;

(function () {
  "use strict";
  $(function () {
    setTimeout(() => {
      console.clear();
      let basicUserInfo = undefined;
      let CourseSideBarCanClick = true;
      renderGUI();

      async function renderGUI() {
        headerCourseWithToken["token"] = getUserTk();
        await preRender();
        renderGuiOnListAndCourse();
        renderGuiOnPractisePage();
      }

      async function preRender() {
        GM_addStyle(style);
        basicUserInfo = await getBasicUserInfo();
        let schoolInfo = await getSchoolInfo();
        basicUserInfo["data"]["schoolId"] = schoolInfo["data"]["schoolId"];
      }

      //以下均是是渲染界面的函数
      function renderGuiOnPractisePage() {
        let navFunction = $(".ewt-common-header-nav");
        if (navFunction.length == 0) return;
        let navFnUl = navFunction.find("ul")[0];
        let appendedElement =
          '<li><a style="color:red;text-decoration:underline" id="ewt-toolbox-btn"> ewt工具箱 </a></li>';
        $(navFnUl).append($(appendedElement));
        $("#ewt-toolbox-btn").click(async () => {
          renderBackground();
          await renderMainWindow();
          await drawWindowBody_Homework();
        });
      }

      function renderGuiOnListAndCourse() {
        let navFunction = $(".right-31MZp");
        if (navFunction.length == 0) return;

        let courseLstEle =
          $(".page-wrapper-3BCMS").length == 0 &&
          $(".play_video_main_content_box").length == 0;
        if (courseLstEle) return;
        navFunction.prepend(
          '<a class="home-2cCGb" id="ewt-toolbox-btn"><div class="big-circle-area-atdoI" style="background-color:rgba(255,0,0,0.6)">ewt工具箱</div></a>'
        );
        $("#ewt-toolbox-btn").click(async () => {
          renderBackground();
          await renderMainWindow();
          if (
            document.getElementsByClassName("play_video_main_box").length != 0
          )
            await drawWindowBody_Course();
          else await drawWindowBody_Courses();
        });
      }

      function renderBackground() {
        GM_addStyle(style);
        let rootE =
          $("#app").length != 0 ? $("#app") : $($(".mst-ewt-common-header")[0]);
        rootE.prepend("<div id='window-bg'></div>");
      }

      async function renderMainWindow() {
        var bg = document.getElementById("window-bg");
        $(bg).append("<div id='window-main'></div>");
        let windowMain = $("#window-main");
        windowMain.append(await navComponent());
        windowMain.append($("<div class='kewt-window-body'></div>"));
        let closeBtn = $("#close-btn");
        closeBtn.mouseup(() => {
          closeWindow();
        });
        $(bg).prepend(windowMain);
        const windowAnimation = windowMain.animate(
          { opacity: 1, marginBottom: "-=100px" },
          200
        );
      }

      //以下都是组件系统
      async function navComponent() {
        let root = $(`<div class='kewt-window-nav'>
                     </div>`);
        root.prepend(
          $(
            `<div id='close-btn'><label class='close-btn-label'>C</label></div>`
          )
        );
        let userCol = $("<div class='kewt-tscol'></div>");
        userCol.append(
          $(
            `<div class='kewt-title'>` +
              basicUserInfo["data"]["realName"] +
              `</div>`
          )
        );
        userCol.append(
          $(
            "<div class='kewt-subject'>ID:" +
              basicUserInfo["data"]["userId"] +
              "</div>"
          )
        );

        let authorCol = $("<div class='kewt-tscol kewt-tscol-right'></div>");
        authorCol.append("<div class='kewt-title'>作者:Sudo-su-Bash,并且由WTE精简</div>");
        root.prepend(authorCol);
        root.prepend(userCol);
        return root;
      }

      function logComponent(uniqueId, height) {
        let root = $(
          "<div class='kewt-log-box' id='" +
            uniqueId +
            "' style='height: " +
            height +
            "px'></div>"
        );
        return root;
      }

      function addLog(uid, text) {
        let component = $("#" + uid);
        if (component != undefined)
          component.append(
            $("<div>" + new Date().toLocaleTimeString() + " " + text + "</div>")
          );
      }

      async function drawWindowBody_Course() {
        let courseInfo = getUrlInfo(window.location.href);
        let result = await getCourseInfo(
          courseInfo["lessonId"],
          basicUserInfo["data"]["schoolId"],
          courseInfo["homeworkId"]
        );
        let homework = await getPractiseOrExamPaperInfo(
          courseInfo["homeworkId"],
          [parseInt(courseInfo["lessonId"])],
          basicUserInfo["data"]["schoolId"]
        );

        let root = $(".kewt-window-body");

        let courseTxt = $("<div class='kewt-course-text'>课程</div>");
        let courseDetail = $("<div class='kewt-course-detail'></div>");
        let courseName = $(
          "<div class='kewt-course-col'>课程名:" +
            result["data"]["lessonName"] +
            "</div>"
        );
        let courseSubject = $(
          "<div class='kewt-course-col'>课程学科:" +
            result["data"]["subjectName"] +
            "</div>"
        );
        let courseId = $(
          "<div class='kewt-course-col'>课程id:" +
            result["data"]["courseId"] +
            "</div>"
        );
        let courseDesc = $(
          "<div class='kewt-course-col'>课程介绍:" +
            result["data"]["description"] +
            "</div>"
        );
        let playTime = $(
          "<div class='kewt-course-col'>完整播放时间:" +
            result["data"]["playTime"] +
            "</div>"
        );
        let homeworkDoing = $("<div class='kewt-course-col'>作业网址:</div>");
        for (let i = 0; i < homework["data"].length; i++) {
          homeworkDoing.append(
            $(
              "<a href='" +
                HOMEWORK_DOING_URL.replace(
                  "{%s}",
                  homework["data"][i]["studyTest"]["paperId"]
                ) +
                "'>作业链接</a>&nbsp;&nbsp;"
            )
          );
        }
        root.append(courseTxt);
        courseDetail.append(courseName);
        courseDetail.append(courseSubject);
        courseDetail.append(courseId);
        courseDetail.append(courseDesc);
        courseDetail.append(playTime);
        courseDetail.append(homeworkDoing);
        root.append(courseDetail);

        let func = $(
          "<div class='kewt-course-text kewt-course-top'>工具</div>"
        );
        let funcbtns = $("<div class='kewt-course-funcbtns'></div>");
        root.append(func);

        let jcBtn = $(
          "<div class='kewt-common-btn btn-red' id='jc-btn'><label>跳课</label></div>"
        );
        let fhBtn = $(
          "<div class='kewt-common-btn btn-green' id='fh-btn'><label>填充作业的选择题</label></div>"
        );

        jcBtn.mouseup(async function () {
          await JumpCourseClicked(
            jcBtn,
            courseInfo["lessonId"],
            courseInfo["courseId"],
            courseInfo["homeworkId"]
          );
        });
        fhBtn.mouseup(async function () {
          await FillHomeworkOptionBtnClicked($("#fh-btn"), homework["data"]);
        });

        funcbtns.append(jcBtn);
        funcbtns.append(fhBtn);

        root.append(funcbtns);

        let log = $("<div class='kewt-course-text kewt-course-top'>日志</div>");
        root.append(log);
        root.append(logComponent("kewt-logbox-0", 200));

        addLog("kewt-logbox-0", "现在时间为:" + new Date().toLocaleString());
        addLog(
          "kewt-logbox-0",
          "登录的账户ID:" + basicUserInfo["data"]["userId"]
        );
      }

      //获取日期和作业接口
      async function drawWindowBody_Courses() {
        let uinfo = getUrlInfo(window.location.href);
        let dayinfo = await getDayData([uinfo["homeworkId"]]);
        let missionInfo = await getMissionInfo(
          uinfo["homeworkId"],
          basicUserInfo["data"]["schoolId"]
        );

        let root = $(".kewt-window-body");
        let log = $("<div class='kewt-course-text kewt-course-top'>日志</div>");

        let coursetxt = $("<div class='kewt-course-text'>课程列表</div>");
        let missionName = $(
          "<div class='kewt-course-col'>任务名:" +
            missionInfo["data"]["homeworkTitle"] +
            "</div>"
        );
        let missionId = $(
          "<div class='kewt-course-col'>任务ID:" +
            uinfo["homeworkId"] +
            "</div>"
        );
        let coursesContainer = $("<div class='kewt-course-container'></div>");
        let courseLeft = $("<div class='kewt-course-c-left'></div>");
        let courseRight = $("<div class='kewt-course-c-right'></div>");
        let missions = undefined;
        for (let i = 0; i < dayinfo["data"]["days"].length; i++) {
          let s = $(
            "<div class='kewt-course-l-date'><label>" +
              new Date(dayinfo["data"]["days"][i]["day"]).toLocaleDateString() +
              "</label></div>"
          );
          s.click(async () => {
            if (!CourseSideBarCanClick) return;
            $(
              document.getElementsByClassName("kewt-course-l-date-sel")[0]
            ).removeClass("kewt-course-l-date-sel");
            s.addClass("kewt-course-l-date-sel");

            courseRight.empty();

            missions = await getMissionHomeworks(
              dayinfo["data"]["days"][i]["dayId".toString()],
              dayinfo["data"]["days"][i]["day"],
              [parseInt(uinfo["homeworkId"])]
            );

            for (let j = 0; j < missions["data"]["data"].length; j++) {
              let lessonid = getUrlInfo(
                missions["data"]["data"][j]["contentUrl"]
              )["lessonId"];
              let courseid = getUrlInfo(
                missions["data"]["data"][j]["contentUrl"]
              )["courseId"];
              let homeworkid = getUrlInfo(
                missions["data"]["data"][j]["contentUrl"]
              )["homeworkId"];

              let eleRoot = $("<div class='kewt-course-c-right-ele'></div>");

              eleRoot.append(
                "<div class='kewt-course-c-img'><img src='" +
                  missions["data"]["data"][j]["imgUrl"] +
                  "' class='kewt-cci-i'/></div>"
              );

              let info = $("<div class='kewt-course-c-info'></div>");
              let major = $("<div class='kewt-course-c-major'></div>");
              if (missions["data"]["data"][j]["contentTypeName"] == "课程讲") {
                let btn = $(
                  "<div class='kewt-mission-fn-btn btn-red'>跳过课程</div>"
                );
                btn.click(async function () {
                  await JumpCourseClicked(btn, lessonid, courseid, homeworkid);
                });
                major.append(btn);
              }
              if (
                (missions["data"]["data"][j]["studyTest"] != null &&
                  missions["data"]["data"][j]["contentTypeName"] == "课程讲") ||
                missions["data"]["data"][j]["contentTypeName"] == "试卷"
              ) {
                let btnFoPaper = $(
                  "<div class='kewt-mission-fn-btn btn-green'>填充选择题</div>"
                );
                btnFoPaper.click(async function () {
                  await FillOptionBtnClicked(
                    btnFoPaper,
                    missions["data"]["data"][j]["studyTest"] != null
                      ? [missions["data"]["data"][j]["studyTest"]]
                      : [missions["data"]["data"][j]],
                    missions["data"]["data"][j]["contentTypeName"] == "试卷"
                      ? 205
                      : 204
                  );
                });
                major.append(btnFoPaper);
              }
              info.append(
                "<div class='kewt-cci-title'>[" +
                  missions["data"]["data"][j]["subjectName"] +
                  "]" +
                  missions["data"]["data"][j]["title"] +
                  "</div>"
              );

              if (missions["data"]["data"][j]["contentTypeName"] == "课程讲")
                info.append(
                  "<div class='kewt-cci-id'>课程ID:" + courseid + "</div>"
                );
              else if (missions["data"]["data"][j]["contentTypeName"] == "试卷")
                info.append(
                  "<div class='kewt-cci-id'>试卷报告ID:" +
                    missions["data"]["data"][j]["reportId"] +
                    "</div>"
                );

              info.append(major);
              eleRoot.append(info);
              courseRight.append(eleRoot);
            }
          });
          courseLeft.append(s);
        }

        coursesContainer.append(courseLeft);
        coursesContainer.append(courseRight);
        root.append(coursetxt);
        root.append(missionName);
        root.append(missionId);
        root.append(coursesContainer);

        document.getElementsByClassName("kewt-course-l-date")[0].click();

        let wholeFunc = $("<div class='kewt-course-wfunc'></div>");
        wholeFunc.append(
          $(
            "<div class='kewt-common-btn btn-red' id='jc-whole-btn'><label>点击跳过当天的全部课程</label></div>"
          )
        );
        wholeFunc.append(
          $(
            "<div class='kewt-common-btn btn-green' id='fo-whole-btn'><label>点击填充当天全部练习的选择题</label></div>"
          )
        );
        root.append(wholeFunc);

        $("#jc-whole-btn").click(async () => {
          await JumpDayCourseClicked(missions, uinfo["homeworkId"]);
        });

        $("#fo-whole-btn").click(async () => {
          await FillDayOptionBtnClicked(missions, uinfo["homeworkId"]);
        });
        root.append(log);
        root.append(logComponent("kewt-logbox-0", 200));
        addLog("kewt-logbox-0", "现在时间为:" + new Date().toLocaleString());
        addLog(
          "kewt-logbox-0",
          "登录的账户ID:" + basicUserInfo["data"]["userId"]
        );
      }

      async function drawWindowBody_Homework() {
        let urlInfo = getUrlInfo(window.location.href);
        let paperid = urlInfo["paperId"];
        let bizCode = urlInfo["bizCode"];

        let paperBasicInfo = await getHomeworkInfo(paperid, parseInt(bizCode));
        let paperContent = await getHomeworkPaper(
          paperBasicInfo["data"]["reportId"],
          parseInt(bizCode)
        );

        let root = $(".kewt-window-body");
        let homeworktxt = $("<div class='kewt-homework-text'>作业</div>");
        let haveChooseQues = false;
        root.append(homeworktxt);

        let homeworkInfo = $("<div class='kewt-homework-detail'></div>");
        let homeworkId = $(
          "<div class='kewt-homework-col'>作业ID:" +
            paperBasicInfo["data"]["reportId"] +
            "</div>"
        );
        let homeworkName = $(
          "<div class='kewt-homework-col'>作业名称:" +
            paperContent["data"]["title"] +
            "</div>"
        );
        let homeworkContainer = $(
          "<div class='kewt-homework-container'></div>"
        );

        drawQuestions(homeworkContainer, paperContent["data"]["questions"]);

        function drawQuestions(parentContainer, questionList) {
          let quesIndex = 1;
          for (let i of questionList) {
            let quesContainer = $("<div class='kewt-ques-container'></div>");
            quesContainer.append($(i["questionContent"]));

            let statusBar = $("<div class='ques-status-bar'></div>");
            statusBar.append(
              $("<div class='blue-container'>" + quesIndex + "</div>")
            );
            statusBar.append(
              $(
                "<div class='ques-c-info orange-container'>" +
                  i["cateName"] +
                  "</div>"
              )
            );
            statusBar.append(
              $(
                "<div class='ques-c-info red-container'>试题ID:" +
                  i["id"] +
                  "</div>"
              )
            );
            if (i["options"].length != 0) {
              haveChooseQues = true;
              let choices = i["options"];
              let rightAnswer = i["rightAnswer"];
              let optionContainer = $(
                "<div class='ques-answer-container''></div>"
              );
              for (let j of choices) {
                let element = $(
                  `<div class='ques-options-option'>
                        <div class='ques-options-choice-dot'>` +
                    j["choice"] +
                    `
                        </div><div class='ques-option-content'>` +
                    j["option"] +
                    `</div></div>
                        `
                );
                if (rightAnswer.indexOf(j["choice"]) != -1) {
                  let answer = $(element.children(".ques-options-choice-dot"));
                  answer.removeClass("ques-options-choice-dot");
                  answer.addClass("ques-options-choice-dot-heart");
                }
                optionContainer.append(element);
              }
              quesContainer.append(optionContainer);
            } else {
              let rightAnswer = i["rightAnswer"];
              let answerContainer = $(
                "<div class='ques-answer-container ques-answer-parse'></div>"
              );
              answerContainer.append(
                "<div class='ques-opt-container'>" +
                  (i["childQuestions"].length == 0 ? "答案" : "小题部分") +
                  "</div>"
              );
              let answerParseContainer = $(
                "<div class='ques-parse-container'></div>"
              );
              if (i["childQuestions"].length != 0)
                drawQuestions(answerParseContainer, i["childQuestions"]);
              else {
                for (let j of rightAnswer) {
                  answerParseContainer.append(j);
                  answerParseContainer.append("&nbsp;&nbsp;&nbsp;");
                }
              }
              answerContainer.append(answerParseContainer);
              quesContainer.append(answerContainer);
            }
            quesContainer.prepend(statusBar);
            parentContainer.append(quesContainer);
            quesIndex++;
          }
        }

        homeworkInfo.append(homeworkId);
        homeworkInfo.append(homeworkName);
        root.append(homeworkInfo);
        root.append(homeworkContainer);

        root.append(
          $("<div class='kewt-homework-text kewt-homework-top'>工具</div>")
        );
        root.append("<div class='kewt-hwk-menu'></div>");
        let fhBtn = undefined;
        if (haveChooseQues) {
          fhBtn = $(
            "<div class='kewt-common-btn btn-green'><label>点击填充作业的选择题</label></div>"
          );
          fhBtn.mouseup(async () => {
            await FillOptionBtnClicked(
              fhBtn,
              [paperBasicInfo["data"]],
              bizCode
            );
          });
        } else
          fhBtn = $(
            "<div class='kewt-common-btn btn-unclick'><label>抱歉,这张试卷没有选择题</label></div>"
          );

        root.append(fhBtn);
      }

      //以下均是跟窗口有关的函数
      function closeWindow() {
        let bg = $("#window-bg");
        let wm = $("#window-main");
        CourseSideBarCanClick = true;
        wm.animate({ opacity: 0, marginBottom: "+=100px" }, 200);
        setTimeout(() => {
          wm.css("display", "none");
          bg.remove();
        }, 220);
      }

      //以下均是跟事件绑定有关的函数
      async function JumpCourseClicked(jcbtn, lessonid, courseid, homeworkId) {
        let cannotClick = jcbtn.hasClass("btn-unclick");
        if (cannotClick == true) return;
        jcbtn.removeClass("btn-red");
        jcbtn.addClass("btn-unclick");
        addLog("kewt-logbox-0", "");
        addLog("kewt-logbox-0", "===== 欢迎使用ewt跳课程序!");
        addLog("kewt-logbox-0", "开始跳课..");

        let courseInfo = await getCourseInfo(
          lessonid,
          basicUserInfo["data"]["schoolId"],
          homeworkId
        );
        addLog("kewt-logbox-0", "课程名:" + courseInfo["data"]["lessonName"]);
        await finishCourseFn(lessonid, homeworkId, courseid);
        jcbtn.text("跳课成功!");
        addLog("kewt-logbox-0", "All done,have fun! Author QQ:2729379058");
      }

      async function JumpDayCourseClicked(missions, homeworkId) {
        if (CourseSideBarCanClick == false) return;
        CourseSideBarCanClick = false;

        $("#fo-whole-btn").css("visibility", "hidden");
        let lessonid, courseid, phomeworkid;
        let ele = document.getElementsByClassName("kewt-course-c-right-ele");
        addLog("kewt-logbox-0", "=== 欢迎使用ewt跳课程序!");
        addLog("kewt-logbox-0", "=== 开始跳过当天的所有课程...");
        addLog("kewt-logbox-0", "使命任务ID:" + homeworkId);
        for (let j = 0; j < missions["data"]["data"].length; j++) {
          lessonid = getUrlInfo(missions["data"]["data"][j]["contentUrl"])[
            "lessonId"
          ];
          courseid = getUrlInfo(missions["data"]["data"][j]["contentUrl"])[
            "courseId"
          ];
          phomeworkid = getUrlInfo(missions["data"]["data"][j]["contentUrl"])[
            "homeworkId"
          ];
          if (missions["data"]["data"][j]["contentTypeName"] == "课程讲") {
            let courseInfo = await getCourseInfo(
              lessonid,
              basicUserInfo["data"]["schoolId"],
              phomeworkid
            );
            addLog("kewt-logbox-0", "==================");
            addLog(
              "kewt-logbox-0",
              "开始跳课,课程名:" + courseInfo["data"]["lessonName"]
            );
            let jcbtn = $(ele[j].getElementsByClassName("btn-red")[0]);
            jcbtn.removeClass("btn-red");
            jcbtn.addClass("btn-unclick");
            jcbtn.text("跳课成功!");
            await finishCourseFn(lessonid, phomeworkid, courseid);
          }
        }
        $("#fo-whole-btn").css("visibility", "visible");
        addLog("kewt-logbox-0", "All done,have fun! Author QQ:2729379058");
        CourseSideBarCanClick = true;
      }

      async function FillOptionBtnClicked(fhBtn, homeworks, bizCode) {
        console.log(homeworks);
        let cannotClick = fhBtn.hasClass("btn-unclick");
        if (cannotClick == true) return;
        fhBtn.removeClass("btn-green");
        fhBtn.addClass("btn-unclick");

        addLog("kewt-logbox-0", "");
        addLog("kewt-logbox-0", "===== 欢迎使用ewt选择题自动填充程序!");
        let fail = false;
        for (let i = 0; i < homeworks.length; i++) {
          let paperid = null;
          addLog("kewt-logbox-0", "");
          addLog(
            "kewt-logbox-0",
            "开始自动填充第 " +
              (i + 1) +
              " 份(共 " +
              homeworks.length +
              " 份)作业/卷的选择题..."
          );
          if (homeworks[i]["paperId"] != null)
            paperid = homeworks[i]["paperId"];
          //说实话可以直接用返回结果的reportId,但是为了兼容性和代码简洁性我还是先用paperId间接求取reportId
          else if (homeworks[i]["contentTypeName"] == "试卷")
            paperid = getUrlInfo(homeworks[i]["contentUrl"])["paperId"];

          if (await FillOptionBtnEvent(paperid, bizCode)) {
            addLog(
              "kewt-logbox-0",
              "第 " + (i + 1) + " 份作业/试卷选择题填写完毕."
            );
          } else {
            addLog(
              "kewt-logbox-0",
              "第" + (i + 1) + "份作业/试卷选择题填写失败.程序终止."
            );
            fhBtn.addClass("btn-green");
            fhBtn.removeClass("btn-unclick");
            fhBtn.text("重试填写选择题...");
            fail = true;
            break;
          }
        }
        if (!fail) fhBtn.text("填写成功(如果你在作业界面请按F5刷新一下)!");
        addLog("kewt-logbox-0", "All done,have fun! Author QQ:2729379058");
      }

      async function FillHomeworkOptionBtnClicked(fhBtn, data) {
        console.log(data);
        let hwkArr = [];
        for (let i = 0; i < data.length; i++) hwkArr.push(data[i]["studyTest"]);
        FillOptionBtnClicked(fhBtn, hwkArr, 204);
      }

      async function FillDayOptionBtnClicked(missions, homeworkId) {
        if (CourseSideBarCanClick == false) return;
        CourseSideBarCanClick = false;
        $("#jc-whole-btn").css("visibility", "hidden");
        let ele = document.getElementsByClassName("kewt-course-c-right-ele");
        addLog("kewt-logbox-0", "=== 欢迎使用ewt自动填充选择题程序!");
        addLog(
          "kewt-logbox-0",
          "=== 开始填写当天课程附带练习/试卷上所有的选择题..."
        );
        addLog("kewt-logbox-0", "使命任务ID:" + homeworkId);

        let eles = document.getElementsByClassName("kewt-course-c-right-ele");
        let data = missions["data"]["data"];
        for (let j = 0; j < data.length; j++) {
          let success = false;
          addLog("kewt-logbox-0", "===============");
          if (data[j]["contentTypeName"] == "试卷") {
            let contentUrlArg = getUrlInfo(data[j]["contentUrl"]);
            success = await FillOptionBtnEvent(contentUrlArg["paperId"], 205);
          } else if (data[j]["studyTest"] != null)
            success = await FillOptionBtnEvent(
              data[j]["studyTest"]["paperId"],
              204
            );
          if (success) {
            $(eles[j].getElementsByClassName("btn-green")[0]).text("填写成功!");
            $(eles[j].getElementsByClassName("btn-green")[0]).addClass(
              "btn-unclick"
            );
            $(eles[j].getElementsByClassName("btn-green")[0]).removeClass(
              "btn-green"
            );
          } else {
            $(eles[j].getElementsByClassName("btn-green")[0]).html("重试");
          }
        }
        $("#jc-whole-btn").css("visibility", "visible");
        addLog("kewt-logbox-0", "All done.Have fun! Author QQ:2729379058");
        CourseSideBarCanClick = true;
      }

      async function FillOptionBtnEvent(paperId, bizCode) {
        let paperInfo = await getHomeworkInfo(paperId, bizCode);
        let reportId = paperInfo["data"]["reportId"];
        let paperContent = await getHomeworkPaper(reportId, bizCode);
        let finalAnswer = processSelectQuestionAnswer(
          paperContent["data"]["questions"]
        );
        addLog(
          "kewt-logbox-0",
          "试卷/作业标题:" + paperContent["data"]["title"]
        );
        addLog(
          "kewt-logbox-0",
          "试卷/作业ID:" + paperContent["data"]["paperId"]
        );
        let res = await fillOption(paperId, reportId, finalAnswer, bizCode);

        if (res["success"]) addLog("kewt-logbox-0", "自动填写选择题完成.");
        else
          addLog(
            "kewt-logbox-0",
            "填充选择题失败(错误代码:" +
              res["code"] +
              ",错误原因:" +
              res["msg"] +
              ")"
          );
        return res["success"];
      }

      //以下均是跟请求网络接口有关的函数(即最底层网络访问接口)

      //跳课接口
      async function finishCourse(lessonid, courseId) {
        let vid = await getCourseInfo(
          lessonid,
          basicUserInfo["data"]["schoolId"],
          courseId
        );
        let sign = new getSignature(vid["data"]["playTime"]);
        let data = {
          CommonPackage: {
            mstid: getUserTk(),
            os: "MacIntel",
            playerType: 1,
            userid: parseInt(basicUserInfo["data"]["userId"]),
            sdkVersion: "2.0.0",
            resolution: "1920*1080",
            browser: "Edge",
            browser_ver:
              "5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.76",
            playerType: 1,
            sdkVersion: "2.0.0",
          },
          EventPackage: [
            {
              lesson_id: lessonid,
              begin_time: sign.begin + "",
              quality: "高清",
              speed: 1,
              status: 1,
              video_type: 1,
              course_id: courseId,
              stay_time: sign.duration * 1000,
              report_time: sign.begin + sign.duration * 1000,
              action: 4,
            },
          ],
          signature: await sign.getRealSignature(),
          sn: "ewt_web_video_detail",
        };
        let res = await requestJson("POST", COURSE_BATCH_URL, headerJump, data);
        return JSON.parse(res["responseText"]);
      }

      async function getMissionInfo(hid, sid) {
        let res = await request(
          "GET",
          MISSION_INFO_URL.replace("{hid}", hid).replace("{sid}", sid),
          header
        );
        return JSON.parse(res["responseText"]);
      }
      //选择题填涂接口
      async function fillOption(paperId, reportId, answers, bizCode) {
        let data = {
          answers: answers,
          assignPoints: false,
          bizCode: bizCode.toString(),
          paperId: paperId.toString(),
          platform: "1",
          reportId: reportId.toString(),
        };

        let res = await requestJson(
          "POST",
          SUBMIT_ANSWER_URL,
          headerCourseWithToken,
          data
        );
        return JSON.parse(res["responseText"]);
      }

      //获取试卷题目接口
      async function getHomeworkPaper(reportId, bizCode) {
        let res = await request(
          "GET",
          HOMEWORK_GET_ANSWER_URL.replace("{reportid}", reportId).replace(
            "{bizCode}",
            bizCode
          ),
          header
        );
        return JSON.parse(res["responseText"]);
      }

      //获取作业接口
      async function getHomeworkInfo(paperId, bizCode) {
        //
        let res = await request(
          "GET",
          HOMEWORK_INFO_URL.replace("{paperId}", paperId).replace(
            "{bizCode}",
            bizCode
          ),
          header
        );
        return JSON.parse(res["responseText"]);
      }

      //获取基本用户信息
      async function getBasicUserInfo() {
        let res = await request("GET", GET_USER_URL, header, null);
        return JSON.parse(res["responseText"]);
      }

      //获取课程信息
      async function getCourseInfo(lessonid, schoolid, homeworkid) {
        let data = {
          lessonId: parseInt(lessonid),
          schoolId: schoolid,
          homeworkId: parseInt(homeworkid),
        };
        let headerC = headerCourse;
        headerC["Content-Type"] = "application/json";
        let res = await requestJson(
          "POST",
          GET_LESSON_DETAIL_URL,
          headerC,
          data
        );
        return JSON.parse(res["responseText"]);
      }

      //获取学校信息
      async function getSchoolInfo() {
        let res = await request("GET", SCHOOL_URL, headerCourseWithToken);
        return JSON.parse(res["responseText"]);
      }

      //获取某个视频的练习链接接口
      async function getPractiseOrExamPaperInfo(
        homeworkId,
        lessonIds,
        schoolId
      ) {
        let data = {
          homeworkId: parseInt(homeworkId),
          lessonIdList: lessonIds,
          schoolId: schoolId,
        };
        let res = await requestJson(
          "POST",
          LESSON_HOMEWORK_URL,
          headerCourseWithToken,
          data
        );
        return JSON.parse(res["responseText"]);
      }

      //用于跳课部分的接口
      async function getHMACSecret() {
        let res = await requestJson(
          "GET",
          HMAC_SECRET_ID_URL.replace("{%s}", basicUserInfo["data"]["userId"]),
          header
        );
        return JSON.parse(res["responseText"]);
      }

      //获取作业日期接口
      async function getDayData(homeworks) {
        let header = headerCourseWithToken;
        header["Content-Type"] = "application/json";
        let data = {
          homeworkIds: homeworks,
          sceneId: 0,
          taskDistributionTypeEnum: 1,
          schoolId: basicUserInfo["data"]["schoolId"],
        };
        let res = await requestJson("POST", DAY_URL, header, data);
        return JSON.parse(res["responseText"]);
      }

      async function getMissionHomeworks(dayid, days, homeworks) {
        let data = {
          day: days,
          dayId: dayid,
          homeworkIds: homeworks,
          pageIndex: 1,
          pageSize: 1000,
          sceneId: 0,
          schoolId: basicUserInfo["data"]["schoolId"],
        };
        let res = await requestJson(
          "POST",
          COURSE_URL,
          headerCourseWithToken,
          data
        );
        return JSON.parse(res["responseText"]);
      }

      function request(method, url, headers, data) {
        return new Promise((resolve) => {
          GM_xmlhttpRequest({
            method: method,
            url: url,
            data: data,
            headers: headers,
            onload: (res) => {
              resolve(res);
            },
          });
        });
      }

      function requestJson(method, url, headers, data) {
        headers["Content-Type"] = "application/json";
        return new Promise((resolve) => {
          GM_xmlhttpRequest({
            method: method,
            url: url,
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            headers: headers,
            onload: (res) => {
              resolve(res);
            },
          });
        });
      }

      //工具接口
      function getUrlInfo(url) {
        let urlInfos = url.split("?")[url.split("?").length - 1];
        let urlArgs = urlInfos.split("&");
        let result = {};
        for (let i = 0; i < urlArgs.length; i++) {
          let k = urlArgs[i].split("=")[0];
          let v = urlArgs[i].split("=")[1];
          result[k] = v;
        }
        return result;
      }

      function getUserTk() {
        let cookie = document.cookie.split(";");
        let result = {};
        for (let i = 0; i < cookie.length; i++) {
          let k = cookie[i].split("=")[0].substring(1);
          let v = cookie[i].split("=")[1];
          result[k] = v;
        }
        return result["token"];
      }

      //getSignature:详见ewt_player.js的第 9859 - 9884 行,那儿有权威的加密方案,我这儿只是做一个复刻
      class getSignature {
        constructor(videoTime) {
          this.begin = Date.now();
          this.duration =
            (parseInt(videoTime.split(":")[0]) * 60 +
              parseInt(videoTime.split(":")[1]) -
              45) *
            1000;
          this.param =
            "action=4&duration={duration}&mstid={mstid}&signatureMethod=HMAC-SHA1&signatureVersion=1.0&timestamp={timestamp}&version=2022-08-02";
          this.sessionId = this.secret = undefined;
          this.duration =
            (parseInt(videoTime.split(":")[0]) * 60 +
              parseInt(videoTime.split(":")[1]) -
              45) *
            1000;
        }

        async getSecret() {
          let tk = await getHMACSecret();
          let sessionid = tk["data"]["sessionId"];
          this.secret = tk["data"]["secret"];
          headerJump["x-bfe-session-id"] = sessionid;
          headerJump["token"] = getUserTk();
        }

        async getRealSignature() {
          await this.getSecret();
          addLog("kewt-logbox-0", "本次接口签名:" + this.secret);
          let rp = this.param
            .replace("{duration}", this.duration * 1000)
            .replace("{mstid}", getUserTk())
            .replace("{timestamp}", this.begin + this.duration * 1000);
          return CryptoJS.HmacSHA1(rp, this.secret).toString();
        }
      }

      function processSelectQuestionAnswer(questions) {
        let res = [];

        getSelectQuestionAnswer(questions);
        function getSelectQuestionAnswer(questions) {
          for (let i = 0; i < questions.length; i++) {
            let obj = {};
            if (questions[i]["childQuestions"].length != 0) {
              getSelectQuestionAnswer(questions[i]["childQuestions"]);
            }
            if (
              questions[i]["cateName"] == "单选" ||
              questions[i]["cateName"] == "多选"
            ) {
              obj["answers"] = questions[i]["rightAnswer"];
              obj["questionId"] = questions[i]["id"];
              obj["questionNo"] = questions[i]["questionNo"];
              obj["totalSeconds"] = 50;
              obj["cateId"] = questions[i]["cate"];
              res.push(obj);
            }
          }
        }
        return res;
      }

      async function finishCourseFn(lessonid, homeworkId, courseid) {
        let res = await finishCourse(lessonid, courseid);
        if (res["success"] != true) {
          addLog(
            "kewt-logbox-0",
            "抱歉,跳课失败(错误代码:" +
              res["code"] +
              ",错误原因:" +
              res["msg"] +
              ")."
          );
          jcbtn.removeClass("btn-unclick");
          jcbtn.addClass("btn-red");
          jcbtn.html("<label>重试</label>");
        }
      }
    }, 1500);
  });
})();
