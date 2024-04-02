import {Entity, model, property, hasMany} from '@loopback/repository';
import {Post} from './post.model';
import {Category} from './category.model';

@model({settings: {strict: true}})
export class Tag extends Entity {
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
  name: string;

  @hasMany(() => Post, {through: {model: () => Category}})
  posts: Post[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Tag>) {
    super(data);
  }
}

export interface TagRelations {
  // describe navigational properties here
}

export type TagWithRelations = Tag & TagRelations;
