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
}

export { loginWith, addNewBlog }