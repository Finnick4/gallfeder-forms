
export const isLoggedIn = (): boolean => {
    const is = document.cookie.split(" ").find(c => c.startsWith("isLoggedIn"))?.endsWith("true")
    return is == undefined ? false : is;
}