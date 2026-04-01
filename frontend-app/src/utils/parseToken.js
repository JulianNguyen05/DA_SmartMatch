// frontend/src/utils/parseToken.js

export const parseToken = (token) => {
  try {
    // JWT có 3 phần ngăn cách bởi dấu chấm, phần Payload nằm ở giữa (index 1)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Giải mã chuỗi base64 thành string JSON, sau đó parse thành Object
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    return null;
  }
};