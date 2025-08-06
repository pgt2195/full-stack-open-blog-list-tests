const { expect } = require('@playwright/test')

const loginWith = async (page, username, password)  => {
  // On clique sur le bouton pour afficher le formulaire de login
  await page.getByRole('button', { name: 'login' }).click()

  // On remplit les champs et on clique sur le bouton 'login'
  const textboxes = await page.getByRole('textbox').all()
  await textboxes[0].fill(username)
  await textboxes[1].fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const addNewBlog = async (page, title, author, url) => {
  // On clique sur le bouton pour ajouter un nouveau blog
  await page.getByRole('button', { name: 'add new blog' }).click()

  // On ajoute un nouveau blog
  await page.getByTestId('title').fill(title)
  await page.getByTestId('author').fill(author)
  await page.getByTestId('url').fill(url)
  await page.getByRole('button', { name: 'save' }).click()
  await expect(page.locator('.success').filter({ hasText: title })).toBeVisible() //permet d'attendre la réponse du serveur avant d'enchainer
}

const createNewUser = async (request, username, name, password) => {
  await request.post('/api/users', {
    data: {
      username: username,
      name: name,
      password: password
    }
  })
}

const likeBlogXTime = async (blogUnit, x) => {
  await blogUnit.getByRole('button', { name: 'view' }).click()
  for (let i = 0; i < x; i++) {
    await blogUnit.getByRole('button', { name: 'like' }).click()
    await expect(blogUnit.getByText(`Likes: ${i+1}`)).toBeVisible() //permet d'attendre la reponse du serveur avant d'enchainer
  }
}

export { loginWith, addNewBlog, createNewUser, likeBlogXTime }