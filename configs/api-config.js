export const IP_ADDRESS = "quizzletc.onrender.com"

export const API_BASE = `https://${IP_ADDRESS}`

// Auth
export const API_LOGIN = `${API_BASE}/api/login`
export const API_REGISTER = `${API_BASE}/api/create-user`
export const API_GET_USER = `${API_BASE}/api/user`
export const API_UPDATE_PROFILE = `${API_BASE}/api/update`

// Profile
export const API_USER_PROFILE = `${API_BASE}/api/profile`
export const API_USER_TOPICS = `${API_BASE}/api/topics`
export const API_USER_COMMENTS = `${API_BASE}/api/comments`

// Quiz
export const API_QUIZZES = `${API_BASE}/api/quizz/get-test`
export const API_QUIZ_DETAILS = `${API_BASE}/api/quizz/test`
export const API_TAKE_TEST = `${API_BASE}/api/quizz/take-test`
export const API_SEARCH_QUIZZES = `${API_BASE}/api/quizz/search`
export const API_HISTORY_TAKE_QUIZ_BY_UID = `${API_BASE}/api/quizz/sessions/user`

// Forum 
export const API_TOPICS = `${API_BASE}/api/t`
export const API_CREATE_TOPIC = `${API_BASE}/api/t/create`
export const API_TOPIC_BY_ID = `${API_BASE}/api/t`
export const API_TOPIC_BY_TAG = `${API_BASE}/api/t/tag` 
export const API_SEARCH_TOPICS = `${API_BASE}/api/t/search`

// Comment
export const API_COMMENTS = `${API_BASE}/api/c/topic`
export const API_COMMENT_TREE = `${API_BASE}/api/c/comment-tree`
export const API_CREATE_COMMENT = `${API_BASE}/api/c/create`
export const API_DELETE_COMMENT = `${API_BASE}/api/c`

