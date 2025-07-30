const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, addNewBlog } = require('./helpers')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
        data: {
            username: 'Pololo',
            name: 'Paul GT',
            password: 'password'
        }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    // On clique sur le bouton pour afficher le formulaire de login
    await page.getByRole('button', { name: 'login' }).click()
    // On verrifie que le texte qui doit être présent est bien là
    await expect(page.getByText('log in to application')).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    // On vérifie que les deux input boxes sont bien présentes
    const textboxes = await page.getByRole('textbox').all()
    await expect(textboxes).toHaveLength(2)

  })


  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      // On se connecte avec l'utilisateur par default
      await loginWith(page, 'Pololo', 'password')

      // On véfie que l'utilisateur est bien connecté et que le boutton
      // de déconnection est bien présent.
      await expect(page.getByText('Paul GT is logged in —')).toBeVisible()
      await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      // On se connecte avec un mauvais mot de passe
      await loginWith(page, 'Pololo', 'wrong password')

      await expect(page.locator('.error')).toContainText('Wrong credentials')
      await expect(page.getByRole('button', { name: 'logout' })).not.toBeVisible()
    })
  })


  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      // On se connecte avec l'utilisateur par default
      await loginWith(page, 'Pololo', 'password')
      await addNewBlog(page, 'test title', 'test author', 'test.com')
    })

    test('a new blog can be created', async ({ page }) => {
      // On vérifie que le blog a bien été ajouté
      await expect(page.locator('.notification')).toContainText('New blog "test title" by test author has been added') // La notif s'affiche
      await expect(page.getByText('test title - by test author')).toBeVisible() // Le blog est ajouté
      await expect(page.getByRole('button', { name: 'view'})).toBeVisible() // Le bouton 'view' est présent, le blog est bien visible dans sa version minimale
    })

    test('a blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'view'}).click()
      await expect(page.getByText('Likes: 0')).toBeVisible()
      await page.getByRole('button', { name: 'like'}).click()
      await expect(page.getByText('Likes: 0')).not.toBeVisible()
      await expect(page.getByText('Likes: 1')).toBeVisible()
      await page.getByRole('button', { name: 'like'}).click()
      await expect(page.getByText('Likes: 1')).not.toBeVisible()
      await expect(page.getByText('Likes: 2')).toBeVisible()
    })

    test.only('a user can delete a blog he has posted', async ({ page }) => {
      await page.getByRole('button', { name: 'view'}).click()
      await page.getByRole('button', { name: 'remove blog'}).click()
      await expect(page.getByText('test title - by test author')).not.toBeVisible() // Le blog a été supprimé
      await expect(page.getByRole('button', { name: 'view'})).not.toBeVisible() 
    })
  })
})