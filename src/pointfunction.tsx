// 导出多个函数
export async function getmyAll(adderss) {
  // 函数一的实现
  try {
    // 构建包含 id 参数的 URL
    const url =
      "https://us-west1-my88dapp.cloudfunctions.net/getmyAll?id=" +
      encodeURIComponent(adderss);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // GET 请求不需要请求体
    });

    if (!response.ok) {
      throw new Error("err:" + response.statusText);
    }

    const data = await response.json();
    //console.log("ok:", data);
    return data;
  } catch (error) {
    //console.error("err2:", error);
    throw error;
  }
}

export async function getTop10() {
  // 函数一的实现
  try {
    // 构建包含 id 参数的 URL
    const url = "https://us-west1-my88dapp.cloudfunctions.net/gettop10";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // GET 请求不需要请求体
    });

    if (!response.ok) {
      throw new Error("err:" + response.statusText);
    }

    const data = await response.json();
    //console.log("ok:", data);
    return data;
  } catch (error) {
    //console.error("err2:", error);
    throw error;
  }
}

export async function getTop10_all() {
  // 函数一的实现
  try {
    // 构建包含 id 参数的 URL
    const url = "https://us-west1-my88dapp.cloudfunctions.net/gettop10";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // GET 请求不需要请求体
    });

    if (!response.ok) {
      throw new Error("err:" + response.statusText);
    }

    const data = await response.json();
    //console.log("ok:", data);
    return data;
  } catch (error) {
    //console.error("err2:", error);
    throw error;
  }
}

export async function gettop10_lastweek() {
  // 函数一的实现
  try {
    // 构建包含 id 参数的 URL
    const url =
      "https://us-west1-my88dapp.cloudfunctions.net/gettop10_lastweek";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // GET 请求不需要请求体
    });

    if (!response.ok) {
      throw new Error("err:" + response.statusText);
    }

    const data = await response.json();
    //console.log("ok:", data);
    return data;
  } catch (error) {
    //console.error("err2:", error);
    throw error;
  }
}

export async function getweekMy(adderss) {
  // 函数一的实现
  try {
    // 构建包含 id 参数的 URL
    const url =
      "https://us-west1-my88dapp.cloudfunctions.net/getweekMy?id=" +
      encodeURIComponent(adderss);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // GET 请求不需要请求体
    });

    if (!response.ok) {
      throw new Error("err:" + response.statusText);
    }

    const data = await response.json();
    //console.log("ok:", data);
    return data;
  } catch (error) {
    //console.error("err2:", error);
    throw error;
  }
}

export async function updatapoint(diges) {
  // 函数一的实现
  try {
    // 构建包含 id 参数的 URL
    const url =
      "https://us-west1-my88dapp.cloudfunctions.net/updata?diges=" +
      encodeURIComponent(diges);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // GET 请求不需要请求体
    });

    if (!response.ok) {
      throw new Error("err:" + response.statusText);
    }

    //const data = await response.json();
    //console.log("ok:", data);
    return response;
  } catch (error) {
    //console.error("err2:", error);
    throw error;
  }
}
