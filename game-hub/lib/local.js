
export const getName = () => {
    const userName = localStorage.getItem("name") || ""
    return userName;
}

export const setName = (name) => {
    localStorage.setItem("name", name);
}