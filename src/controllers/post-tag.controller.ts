import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  HttpErrors,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {
  Post,
  Tag
} from '../models';
import {PostRepository, TagRepository} from '../repositories';

export class PostTagController {
  constructor(
    @repository(PostRepository) protected postRepository: PostRepository,
    @repository(TagRepository) protected tagRepository: TagRepository,
  ) { }

  @get('/posts/{id}/tags', {
    responses: {
      '200': {
        description: 'Array of Post has many Tag through Category',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Tag)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Tag>,
  ): Promise<Tag[]> {
    return this.postRepository.tags(id).find(filter);
  }

  @post('/posts/{id}/tags', {
    responses: {
      '200': {
        description: 'create a Tag model instance',
        content: {'application/json': {schema: getModelSchemaRef(Tag)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Post.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tag, {
            title: 'NewTagInPost',
            exclude: ['id'],
          }),
        },
      },
    }) tag: Omit<Tag, 'id'>,
  ): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({where: {name: tag.name}});
    if (existingTag) {
      const postTags = await this.postRepository.tags(id).find();
      const relationExists = postTags.some(postTag => postTag.id === existingTag.id);
      if (!relationExists) {
        await this.postRepository.tags(id).link(existingTag.id);
      }
      return existingTag;
    }
    return this.postRepository.tags(id).create(tag);
  }

  @patch('/posts/{id}/tags', {
    responses: {
      '200': {
        description: 'Post.Tag PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tag, {partial: true}),
        },
      },
    })
    tag: Partial<Tag>,
    @param.query.object('where', getWhereSchemaFor(Tag)) where?: Where<Tag>,
  ): Promise<Count> {
    return this.postRepository.tags(id).patch(tag, where);
  }

  @del('/posts/{id}/tags', {
    responses: {
      '200': {
        description: 'Post.Tag DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Tag)) where?: Where<Tag>,
  ): Promise<Count> {
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) {
      throw new HttpErrors.NotFound('Post not found');
    }
    const existingTag = await this.tagRepository.findOne({where});
    if (!existingTag) {
      throw new HttpErrors.NotFound('Tag not found');
    }
    await this.postRepository.tags(id).unlink(existingTag.id);

    return {count: 1};
  }
}
