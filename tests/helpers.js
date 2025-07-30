const loginWith = async (page, username, password)  => {
  // On clique sur le bouton pour afficher le formulaire de login
  await page.getByRole('button', { name: 'login' }).click()

  // On remplit les champs et on clique sur le bouton 'login'
  const textboxes = await page.getByRole('textbox').all()
  await textboxes[0].fill(username)
  await textboxes[1].fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

export { loginWith }