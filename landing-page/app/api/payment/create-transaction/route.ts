import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      description,
      customer,
      metadata,
    } = body;

    // Validation des données
    if (!amount || !customer) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const fedapaySecretKey = process.env.FEDAPAY_SECRET_KEY;
    const fedapayEnvironment = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';
    const callbackUrl = process.env.NEXT_PUBLIC_FEDAPAY_CALLBACK_URL;

    if (!fedapaySecretKey) {
      return NextResponse.json(
        { error: 'Configuration FedaPay manquante' },
        { status: 500 }
      );
    }

    // URL de l'API FedaPay
    const apiUrl = fedapayEnvironment === 'sandbox'
      ? 'https://sandbox-api.fedapay.com/v1/transactions'
      : 'https://api.fedapay.com/v1/transactions';

    // Créer la transaction
    const transactionResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fedapaySecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        amount: Math.round(amount), // Montant en nombre entier
        currency: { iso: 'XOF' },
        callback_url: callbackUrl,
        customer: {
          firstname: customer.firstname,
          lastname: customer.lastname,
          email: customer.email || `${customer.phone}@andunu.com`,
          phone_number: {
            number: customer.phone,
            country: 'bj', // Bénin par défaut
          },
        },
        custom_metadata: metadata,
      }),
    });

    if (!transactionResponse.ok) {
      const errorData = await transactionResponse.json();
      console.error('Erreur FedaPay:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la transaction', details: errorData },
        { status: transactionResponse.status }
      );
    }

    const transaction = await transactionResponse.json();
    
    // Vérifier la structure de la réponse
    console.log('Transaction créée:', JSON.stringify(transaction, null, 2));
    
    // La structure de FedaPay est "v1/transaction" (avec slash)
    const transactionData = transaction['v1/transaction'] || transaction;
    
    if (!transactionData || !transactionData.id) {
      console.error('Données de transaction manquantes:', transaction);
      return NextResponse.json(
        { error: 'Données de transaction invalides', details: transaction },
        { status: 500 }
      );
    }

    // FedaPay retourne déjà le payment_token et payment_url dans la réponse
    // Pas besoin de faire un deuxième appel !
    const transactionId = transactionData.id;
    const token = transactionData.payment_token;
    const url = transactionData.payment_url;

    if (!token || !url) {
      console.error('Token ou URL manquant dans la transaction:', transactionData);
      return NextResponse.json(
        { error: 'Token de paiement non généré', details: transactionData },
        { status: 500 }
      );
    }

    console.log('Paiement prêt:', { transactionId, url });

    return NextResponse.json({
      success: true,
      transactionId,
      token,
      url,
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
