import {Entity, hasMany, model, property} from '@loopback/repository';
import {Comment} from './comment.model';
import {Tag} from './tag.model';
import {Category} from './category.model';

@model({settings: {strict: true}})
export class Post extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  content: string;

  @hasMany(() => Comment)
  comments: Comment[];

  @hasMany(() => Tag, {through: {model: () => Category}})
  tags: Tag[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Post>) {
    super(data);
  }
}

export interface PostRelations {
  // describe navigational properties here
}

export type PostWithRelations = Post & PostRelations;
