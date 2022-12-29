const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { Server } = require("socket.io")
const io = new Server({
    cors: {
        origin: "http://localhost:3000"
    }
})
const _naver = require("./src/services/naver/cafeWrite.js");

process.env.SOCKET_PORT = 18092;

let mainWindow = null;
let createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    autoHideMenuBar: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
    },
    resizable: false,
    //titleBarStyle: 'hidden', //: titleBar 가림
    //backgroundColor: '#312450', //: 배경색 변경
    icon: path.join(__dirname, 'public/60x60.png') //: 아이콘 변경
  });

  //: ipcMain.handle('logger_send', async (event, param) => _log.fn_write(param))
  ipcMain.handle('n_cafe_write', async (event, param) => _naver.fn_cafe_write(param))

  //TODO: 개발자 도구 미사용.
  //mainWindow.webContents.openDevTools();

  mainWindow.loadFile(path.join(__dirname, "public/index.html"));

  // 창이 닫히면 호출됩니다.
  mainWindow.on('closed', () => {
    // 윈도우 객체의 참조를 삭제합니다. 보통 멀티 윈도우 지원을 위해
    // 윈도우 객체를 배열에 저장하는 경우가 있는데 이 경우
    // 해당하는 모든 윈도우 객체의 참조를 삭제해 주어야 합니다.
    mainWindow = null
  })
}

  // 이 메서드는 Electron의 초기화가 끝나면 실행되며 브라우저
  // 윈도우를 생성할 수 있습니다. 몇몇 API는 이 이벤트 이후에만
  // 사용할 수 있습니다.
  app.on("ready", () => {
    createWindow();
    io.on('connection', (socket) => {
        socket.on('log', msg => {
            io.emit('log', msg);
        });
    });
    io.listen(18092);
  });

  // 모든 창이 닫히면 애플리케이션 종료.
  app.on('window-all-closed', () => {
    // macOS의 대부분의 애플리케이션은 유저가 Cmd + Q 커맨드로 확실하게
    // 종료하기 전까지 메뉴바에 남아 계속 실행됩니다.
    io.close();

    if (process.platform !== 'darwin') {
        app.quit()
    }
  })

  app.on('activate', () => {
    // macOS에선 보통 독 아이콘이 클릭되고 나서도
    // 열린 윈도우가 없으면, 새로운 윈도우를 다시 만듭니다.
    if (mainWindow === null) {
        createWindow()
    }
})

// 이 파일엔 제작할 애플리케이션에 특화된 메인 프로세스 코드를
// 포함할 수 있습니다. 또한 파일을 분리하여 require하는 방법으로
// 코드를 작성할 수도 있습니다.