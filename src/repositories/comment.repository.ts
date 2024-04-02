import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Comment, CommentRelations, Post} from '../models';
import {PostRepository} from './post.repository';

export class CommentRepository extends DefaultCrudRepository<
  Comment,
  typeof Comment.prototype.id,
  CommentRelations
> {

  public readonly post: BelongsToAccessor<Post, typeof Comment.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('PostRepository') protected postRepositoryGetter: Getter<PostRepository>,
  ) {
    super(Comment, dataSource);
    this.post = this.createBelongsToAccessorFor('post', postRepositoryGetter,);
    this.registerInclusionResolver('post', this.post.inclusionResolver);
  }
}
