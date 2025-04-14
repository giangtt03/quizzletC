export const USER_DATA_CHANGE_EVENT = "user-data-change"

export const notifyUserDataChange = () => {
  if (typeof window !== "undefined") {
    const event = new Event(USER_DATA_CHANGE_EVENT)
    window.dispatchEvent(event)
  }
}
