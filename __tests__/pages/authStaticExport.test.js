describe('Notion OAuth legacy callback in static exports', () => {
  const originalExport = process.env.EXPORT

  afterEach(() => {
    jest.resetModules()
    if (originalExport === undefined) delete process.env.EXPORT
    else process.env.EXPORT = originalExport
  })

  it('leaves the unsupported legacy callback route as a static 404', async () => {
    process.env.EXPORT = 'true'
    const authPage = require('@/pages/auth/index')

    await expect(authPage.getStaticProps()).resolves.toEqual({ notFound: true })
  })
})
