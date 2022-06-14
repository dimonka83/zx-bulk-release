import {suite} from 'uvu'
import * as assert from 'uvu/assert'
import {fileURLToPath} from "node:url"
import {path} from 'zx-extra'

import {parseTag, formatTag, getTags} from '../../main/js/index.js'
import {createFakeRepo} from './test-utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtures = path.resolve(__dirname, '../fixtures')
const test = suite('tag')

test('gets tags', async () => {
  const cwd = await createFakeRepo({commits: [
    {
      msg: 'chore: initial commit',
      files: [
        {
          relpath: './README.md',
          contents: '#Readme'
        },
        {
          relpath: './package.json',
          contents: {
            name: 'root',
            workspaces: ['packages/*']
          }
        }
      ]
    },
    {
      msg: 'feat: init pkg a',
      files: [
        {
          relpath: './packages/a/package.json',
          contents: {
            name: 'a'
          }
        }
      ]
    },
    {
      msg: 'chore(a): a update',
      files: [
        {
          relpath: './packages/a/foo.txt',
          contents: 'foobar'
        }
      ],
      tags: ['2022.6.13-a.v1.0.0-f0']
    },
    {
      msg: 'refactor(a): a refactoring',
      files: [
        {
          relpath: './packages/a/foo.txt',
          contents: 'foobarbaz'
        }
      ]
    },
    {
      msg: 'feat: init pkg b',
      files: [
        {
          relpath: './packages/b/package.json',
          contents: {
            name: 'b',
            dependencies: {
              a: '*'
            }
          }
        }
      ]
    },
    {
      msg: 'fix(b): add some file',
      files: [
        {
          relpath: './packages/b/file.txt',
          contents: 'foo bar'
        }
      ],
      tags: ['2022.6.14-b.v2.0.0-beta.0.Yg-f1']
    }
  ]})

  const tags = await getTags(cwd)

  assert.equal(tags, [{
    name: 'b',
    version: 'v2.0.0-beta.0',
    date: new Date(Date.UTC(2022, 5, 14)),
    format: 'f1'
  },{
    name: 'a',
    version: 'v1.0.0',
    date: new Date(Date.UTC(2022, 5, 13)),
    format: 'f0'
  }])
})


test('formatTag() / parseTag()', () => {
  const cases = [
    [
      '2022.6.22-qiwi.pijma-native.v1.0.0-beta.0+foo.bar-f0',
      {
        name: '@qiwi/pijma-native',
        version: 'v1.0.0-beta.0+foo.bar',
        date: new Date(Date.UTC(2022, 5, 22)),
        format: 'f0'
      }
    ],
    ['2022.6.22-qiwi.pijma-native.v1.0.0-beta.0+foo.bar+broken', null],
    ['2022.6.22-@qiwi/pijma-native.v1.0.0', null],
    ['2022.6.22', null],
    [
      '2022.6.13-a.v1.0.0-f0',
      {
        name: 'a',
        version: 'v1.0.0',
        date: new Date(Date.UTC(2022, 5, 13)),
        format: 'f0'
      }
    ],
    [
      '2022.6.13-examplecom.v1.0.0.ZXhhbXBsZS5jb20-f1',
      {
        name: 'example.com',
        version: 'v1.0.0',
        date: new Date(Date.UTC(2022, 5, 13)),
        format: 'f1'
      }
    ]
  ]

  cases.forEach(([tag, meta, parseonly]) => {
    const parsed = parseTag(tag)
    assert.equal(parsed, meta)

    if (meta !== null && !parseonly) {
      assert.is(formatTag(meta), tag)
    }
  })
})

test.run()