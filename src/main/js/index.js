import {analyze} from './analyze.js'
import {publish} from './publish.js'
import {build} from './build.js'
import {topo} from './topo.js'

export const run = async ({cwd = process.cwd(), env = process.env, flags = {}} = {}) => {
  console.log('zx-bulk-release')

  try {
  const {packages, queue, root} = await topo({cwd, flags})
  console.log('queue:', queue)

  for (let name of queue) {
    const pkg = packages[name]

    await analyze(pkg, packages, root)

    if (pkg.changes.length === 0) continue

    await build(pkg, packages)

    if (flags.dryRun) continue

    await publish(pkg)
  }
  } catch (e) {
    console.error(e)
    throw e
  }
  console.log('Great success!')
}
