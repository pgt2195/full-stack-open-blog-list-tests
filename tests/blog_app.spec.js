const { test, expect, beforeEach, describe } = require('@playwright/test')

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
      // On clique sur le bouton pour afficher le formulaire de login
      await page.getByRole('button', { name: 'login' }).click()

      // On remplit les champs et on clique sur le bouton 'login'
      const textboxes = await page.getByRole('textbox').all()
      await textboxes[0].fill('Pololo')
      await textboxes[1].fill('password')
      await page.getByRole('button', { name: 'login' }).click()

      // On véfie que l'utilisateur est bien connecté et que le boutton
      // de déconnection est bien présent.
      await expect(page.getByText('Paul GT is logged in —')).toBeVisible()
      await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      // On clique sur le bouton pour afficher le formulaire de login
      await page.getByRole('button', { name: 'login' }).click()

      // On remplit les champs et on clique sur le bouton 'login'
      const textboxes = await page.getByRole('textbox').all()
      await textboxes[0].fill('Pololo')
      await textboxes[1].fill('wrong password')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.locator('.error')).toContainText('Wrong credentials')
      await expect(page.getByRole('button', { name: 'logout' })).not.toBeVisible()
    })
  })
})