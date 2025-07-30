const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
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
})