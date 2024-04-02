import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Post, PostRelations, Comment, Tag, Category} from '../models';
import {CommentRepository} from './comment.repository';
import {CategoryRepository} from './category.repository';
import {TagRepository} from './tag.repository';

export class PostRepository extends DefaultCrudRepository<
  Post,
  typeof Post.prototype.id,
  PostRelations
> {

  public readonly comments: HasManyRepositoryFactory<Comment, typeof Post.prototype.id>;

  public readonly tags: HasManyThroughRepositoryFactory<Tag, typeof Tag.prototype.id,
          Category,
          typeof Post.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('CommentRepository') protected commentRepositoryGetter: Getter<CommentRepository>, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>, @repository.getter('TagRepository') protected tagRepositoryGetter: Getter<TagRepository>,
  ) {
    super(Post, dataSource);
    this.tags = this.createHasManyThroughRepositoryFactoryFor('tags', tagRepositoryGetter, categoryRepositoryGetter,);
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
    this.comments = this.createHasManyRepositoryFactoryFor('comments', commentRepositoryGetter,);
    this.registerInclusionResolver('comments', this.comments.inclusionResolver);
  }
}
