import { Article } from '../article/article.schema';
import { Comment } from '../comment/comment.schema';

export const LIKEABLE_ENTITIES = [Article.name, Comment.name] as const;
