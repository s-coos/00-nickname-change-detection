import { Bot, ChatContext } from "@racla-dev/node-iris";

const bot = new Bot("BotName", "127.0.0.1:3000", { maxWorkers: 4 });

const rooms: string[] = ["18461285930353763"];
const roomMap: Partial<Record<string, true>> = Object.fromEntries(
  rooms.map((s) => [s, true])
);
const members: Partial<Record<string, string>> = {};

// 메시지 이벤트 핸들러
bot.on("message", async (context: ChatContext) => {
  if (!(context.room.id in roomMap)) {
    return;
  }

  if (context.message.command === "안녕") {
    await context.reply("안녕하세요!");
  }
});

async function detectNicknameChange() {
  for (const room of rooms) {
    try {
      const queryResult = await fetch("http://localhost:3000/query", {
        method: "POST",
        headers: { accept: "application/json" },
        body: JSON.stringify({
          query:
            "select enc, nickname, user_id from db2.open_chat_member where involved_chat_id = $1",
          bind: [room],
        }),
      });
      const json = await queryResult.json();
      if (members[json.user_id] && members[json.user_id] !== json.nickname) {
        await fetch("http://localhost:3000/reply", {
          method: "POST",
          headers: { accept: "application/json" },
          body: JSON.stringify({
            message: `${json.user_id}의 닉네임이 변경되었습니다:\n변경 전: ${
              members[json.user_id]
            }\n변경 후: ${json.nickname}`,
          }),
        });
      }
      members[json.user_id] = json.nickname;
    } catch (e) {
      console.error(e);
    }
  }
}

setTimeout(async function func() {
  await detectNicknameChange();
  setTimeout(func, 2000); // polling rate
}, 0);

// 봇 시작
bot.run();
