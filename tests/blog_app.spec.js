const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith } = require('./helpers')

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
    })

    test.only('a new blog can be created', async ({ page }) => {
      // On clique sur le bouton pour ajouter un nouveau blog
      await page.getByRole('button', { name: 'add new blog' }).click()

      // On ajoute un nouveau blog
      await page.getByTestId('title').fill('test title')
      await page.getByTestId('author').fill('test author')
      await page.getByTestId('url').fill('test.com')
      await page.getByRole('button', { name: 'save' }).click()

      // On vérifie que le blog a bien été ajouté
      await expect(page.locator('.notification')).toContainText('New blog "test title" by test author has been added') // La notif s'affiche
      await expect(page.getByText('test title - by test author')).toBeVisible // Le blog est ajouté
      // await expect(page.getByRole('button', { name: 'view'})).toBeVisible
    })
  })
})