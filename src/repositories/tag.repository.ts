import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Tag, TagRelations, Post, Category} from '../models';
import {CategoryRepository} from './category.repository';
import {PostRepository} from './post.repository';

export class TagRepository extends DefaultCrudRepository<
  Tag,
  typeof Tag.prototype.id,
  TagRelations
> {

  public readonly posts: HasManyThroughRepositoryFactory<Post, typeof Post.prototype.id,
          Category,
          typeof Tag.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>, @repository.getter('PostRepository') protected postRepositoryGetter: Getter<PostRepository>,
  ) {
    super(Tag, dataSource);
    this.posts = this.createHasManyThroughRepositoryFactoryFor('posts', postRepositoryGetter, categoryRepositoryGetter,);
    this.registerInclusionResolver('posts', this.posts.inclusionResolver);
  }
}
