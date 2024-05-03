const { error } = require("console");
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 3000;

// CORS 설정
app.use(cors());

app.use(express.json());

// 정적 파일을 제공하기 위한 디렉토리 설정
app.use(express.static("public"));

// 루트 URL에 대한 GET 요청 처리
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "page", "index.html"));
});

app.get("/member/add", (req, res) => {
  res.sendFile(path.join(__dirname, "page", "addMember.html"));
});

app.post("/member/add", (req, res) => {
  const { name, tier, rank, line } = req.body; // 요청 본문에서 이름과 티어 추출

  console.log(req.body);

  // 입력 값 검증
  if (!name || !tier || !rank || !line) {
    return res
      .status(400)
      .send({ message: "이름과 티어를 모두 입력해야 합니다." });
  }

  // 파일 읽기
  fs.readFile("data/member.json", (err, data) => {
    if (err) {
      // 파일이 존재하지 않는 경우 새 파일을 생성
      if (err.code === "ENOENT") {
        const members = [req.body]; // 첫 번째 멤버로 배열 생성
        const jsonContent = JSON.stringify(members, null, 2);
        fs.writeFile("data/member.json", jsonContent, "utf8", (err) => {
          if (err) {
            return res.status(500).send({ message: "파일 작성 중 오류 발생" });
          }
          res.send("회원 추가 완료");
        });
      } else {
        return res.status(500).send({ message: "파일 읽기 중 오류 발생" });
      }
    } else {
      // 파일이 이미 존재하는 경우
      const members = JSON.parse(data); // JSON 파싱
      const existingMember = members.find((m) => m.name === name);
      if (existingMember) {
        // 이미 존재하는 이름인 경우 값을 수정
        existingMember.tier = tier;
        existingMember.rank = rank;
        existingMember.line = line;
      } else {
        // 새 멤버 추가
        members.push(req.body);
      }
      const jsonContent = JSON.stringify(members, null, 2);
      fs.writeFile("data/member.json", jsonContent, "utf8", (err) => {
        if (err) {
          return res.status(500).send("파일 작성 중 오류 발생");
        }
        res.send({
          message: existingMember ? "회원 정보 수정 완료" : "회원 추가 완료",
        });
      });
    }
  });
});

app.delete("/member/:name", (req, res) => {
  const name = req.params.name;
  fs.readFile("data/member.json", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res
          .status(404)
          .send({ message: "회원 정보가 존재하지 않습니다." });
      }
      return res.status(500).send({ message: "파일 읽기 중 오류 발생" });
    }
    const members = JSON.parse(data);
    const newMembers = members.filter((m) => m.name !== name);
    if (members.length === newMembers.length) {
      return res
        .status(500)
        .send({ message: "해당 이름의 회원이 존재하지 않습니다." });
    }
    const jsonContent = JSON.stringify(newMembers, null, 2);
    fs.writeFile("data/member.json", jsonContent, "utf8", (err) => {
      if (err) {
        return res.status(500).send({
          message: "멤버 삭제 중 에러 발생 (콘솔을 확인해주세요.)",
          error: err,
        });
      }
      res.send({ message: "회원 삭제 완료" });
    });
  });
});

// app.post("/member/add", (req, res) => {
//   const { name, tier } = req.body; // 요청 본문에서 이름과 티어 추출

//   // 입력 값 검증
//   if (!name || !tier) {
//     return res.status(400).send("이름과 티어를 모두 입력해야 합니다.");
//   }

//   // 파일 읽기
//   fs.readFile("data/member.json", (err, data) => {
//     if (err) {
//       // 파일이 존재하지 않는 경우 새 파일을 생성
//       if (err.code === "ENOENT") {
//         const members = [req.body]; // 첫 번째 멤버로 배열 생성
//         const jsonContent = JSON.stringify(members, null, 2);
//         fs.writeFile("data/member.json", jsonContent, "utf8", (err) => {
//           if (err) {
//             return res.status(500).send("파일 작성 중 오류 발생");
//           }
//           res.send("첫 번째 회원 추가 완료");
//         });
//       } else {
//         return res.status(500).send("파일 읽기 중 오류 발생");
//       }
//     } else {
//       // 파일이 이미 존재하는 경우
//       const members = JSON.parse(data); // JSON 파싱
//       members.push(req.body); // 새 멤버 추가
//       const jsonContent = JSON.stringify(members, null, 2);
//       fs.writeFile("data/member.json", jsonContent, "utf8", (err) => {
//         if (err) {
//           return res.status(500).send("파일 작성 중 오류 발생");
//         }
//         res.send("회원 추가 완료");
//       });
//     }
//   });
// });

app.get("/member/list", (req, res) => {
  res.sendFile(path.join(__dirname, "page", "member.html"));
});

app.get("/member", (req, res) => {
  fs.readFile("data/member.json", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).send("회원 정보가 존재하지 않습니다.");
      }
      return res.status(500).send("파일 읽기 중 오류 발생");
    }
    const members = JSON.parse(data);
    res.json(members);
  });
});

app.get("/stamp/list", (req, res) => {
  fs.readFile("data/stamp.json", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).send("회원 정보가 존재하지 않습니다.");
      }
      return res.status(500).send("파일 읽기 중 오류 발생");
    }
    res.send(JSON.parse(data));
  });
});

app.get("/member/:name", (req, res) => {
  const name = req.params.name;
  fs.readFile("data/member.json", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).send("회원 정보가 존재하지 않습니다.");
      }
      return res.status(500).send("파일 읽기 중 오류 발생");
    }
    const members = JSON.parse(data);
    const member = members.find((m) => m.name === name);
    if (!member) {
      return res.status(404).send("해당 이름의 회원이 존재하지 않습니다.");
    }
    res.json(member);
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
