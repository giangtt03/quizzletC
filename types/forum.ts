export interface Topic {
  _id: string
  title: string
  content: string
  tags?: string[] 
  author?:
    | {
        _id: string
        username: string
        avatar?: string
      }
    | string
  comments?: string[] | Comment[]
  createdAt?: string
  updatedAt?: string
}

export interface Comment {
  _id: string
  content: string
  author?:
    | {
        _id: string
        username: string
        avatar?: string
      }
    | string
  topic: string
  parent?: string | null
  replies?: Comment[]
  createdAt?: string
  updatedAt?: string
}
