import { MapPin, PackageCheck, ShieldCheck, Store, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../utils/imageUrl';

const Checkout = () => {
  const { cart, getSubtotal, syncCartToServer, syncing } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const subtotal = getSubtotal();

  const [locations, setLocations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    delivery_method: 'campus_delivery',
    campus_location_id: '',
    recipient_name: user ? `${user.first_name} ${user.last_name}` : '',
    recipient_phone: user?.phone || '',
    delivery_address: '',
    hostel: '',
    block: '',
    room_number: '',
    pickup_note: '',
    coupon_code: '',
  });

  useEffect(() => {
    api
      .get('/locations/index.php')
      .then((response) => {
        if (response.data.success) setLocations(response.data.data || []);
      })
      .catch((requestError) => {
        console.error('ABUAD location load failed:', requestError);
        setError('Campus fulfilment points are temporarily unavailable.');
      })
      .finally(() => setLoadingLocations(false));
  }, []);

  const availableLocations = useMemo(
    () =>
      locations.filter((location) =>
        formData.delivery_method === 'pickup'
          ? location.type === 'pickup_point'
          : location.type !== 'pickup_point'
      ),
    [locations, formData.delivery_method]
  );

  const selectedLocation = locations.find(
    (location) => Number(location.id) === Number(formData.campus_location_id)
  );
  const deliveryFee =
    formData.delivery_method === 'campus_delivery'
      ? Number(selectedLocation?.delivery_fee || 0)
      : 0;
  const estimatedTotal = subtotal + deliveryFee;

  useEffect(() => {
    if (
      availableLocations.length > 0 &&
      !availableLocations.some(
        (location) => Number(location.id) === Number(formData.campus_location_id)
      )
    ) {
      const location = availableLocations[0];
      setFormData((current) => ({
        ...current,
        campus_location_id: String(location.id),
        delivery_address: location.name,
      }));
    }
  }, [availableLocations, formData.campus_location_id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'campus_location_id'
        ? {
            delivery_address:
              locations.find((location) => String(location.id) === value)?.name || '',
          }
        : {}),
    }));
  };

  const selectMethod = (deliveryMethod) => {
    setFormData((current) => ({
      ...current,
      delivery_method: deliveryMethod,
      campus_location_id: '',
      delivery_address: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Your bag is empty. Add items before checking out.');
      return;
    }
    if (!formData.campus_location_id) {
      setError('Choose an ABUAD pickup or delivery point.');
      return;
    }

    setSubmitting(true);
    try {
      // Server checkout reads DB cart — sync local bag first
      await syncCartToServer();
      const response = await api.post('/checkout/initialize.php', {
        ...formData,
        items: cart.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          quantity: item.quantity,
        })),
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Checkout could not be started.');
      }
      const { authorization_url: authorizationUrl } = response.data.data;
      if (authorizationUrl) window.location.href = authorizationUrl;
      else navigate('/customer/orders');
    } catch (requestError) {
      console.error('Checkout error:', requestError);
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Checkout could not be started. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <PackageCheck size={34} />
        <h1>Your bag is empty.</h1>
        <p>Add a campus find before moving to checkout.</p>
        <Link to="/products">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="abuad-checkout">
      <div className="checkout-heading">
        <p className="eyebrow">Secure ABUAD checkout</p>
        <h1 className="page-heading">How should we get it to you?</h1>
        <p>Choose campus delivery or collect from a designated pickup hub.</p>
      </div>

      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form-card">
          <section>
            <div className="checkout-section-title">
              <span>01</span>
              <div>
                <h2>Fulfilment method</h2>
                <p>Built around life on the ABUAD campus.</p>
              </div>
            </div>
            <div className="fulfilment-options">
              <button
                type="button"
                onClick={() => selectMethod('campus_delivery')}
                className={formData.delivery_method === 'campus_delivery' ? 'selected' : ''}
              >
                <Truck size={21} />
                <span>
                  <strong>Campus delivery</strong>
                  <small>To your college, hostel reception, or campus landmark</small>
                </span>
              </button>
              <button
                type="button"
                onClick={() => selectMethod('pickup')}
                className={formData.delivery_method === 'pickup' ? 'selected' : ''}
              >
                <Store size={21} />
                <span>
                  <strong>Pickup hub</strong>
                  <small>Collect from a designated public campus point</small>
                </span>
              </button>
            </div>
          </section>

          <section>
            <div className="checkout-section-title">
              <span>02</span>
              <div>
                <h2>ABUAD location</h2>
                <p>Select the most convenient campus point.</p>
              </div>
            </div>
            <label className="checkout-field">
              <span>Campus point</span>
              <select
                name="campus_location_id"
                value={formData.campus_location_id}
                onChange={handleChange}
                required
                disabled={loadingLocations}
              >
                <option value="">
                  {loadingLocations ? 'Loading ABUAD locations…' : 'Choose a campus point'}
                </option>
                {availableLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                    {formData.delivery_method === 'campus_delivery'
                      ? ` — ₦${Number(location.delivery_fee).toLocaleString()}`
                      : ' — Free pickup'}
                  </option>
                ))}
              </select>
            </label>

            {formData.delivery_method === 'campus_delivery' && (
              <div className="checkout-field-grid checkout-field-grid-three">
                <label className="checkout-field">
                  <span>Hostel / hall</span>
                  <input
                    name="hostel"
                    value={formData.hostel}
                    onChange={handleChange}
                    placeholder="Your hostel"
                  />
                </label>
                <label className="checkout-field">
                  <span>Block / wing</span>
                  <input
                    name="block"
                    value={formData.block}
                    onChange={handleChange}
                    placeholder="Block"
                  />
                </label>
                <label className="checkout-field">
                  <span>Room</span>
                  <input
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleChange}
                    placeholder="Room no."
                  />
                </label>
              </div>
            )}
          </section>

          <section>
            <div className="checkout-section-title">
              <span>03</span>
              <div>
                <h2>Contact details</h2>
                <p>Used only to coordinate this order.</p>
              </div>
            </div>
            <div className="checkout-field-grid">
              <label className="checkout-field">
                <span>Recipient name</span>
                <input
                  name="recipient_name"
                  value={formData.recipient_name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </label>
              <label className="checkout-field">
                <span>Phone number</span>
                <input
                  type="tel"
                  name="recipient_phone"
                  value={formData.recipient_phone}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                />
              </label>
            </div>
            <label className="checkout-field">
              <span>Directions or pickup note</span>
              <textarea
                name="pickup_note"
                value={formData.pickup_note}
                onChange={handleChange}
                rows={3}
                placeholder="Landmark, preferred time, or helpful directions"
              />
            </label>
            <label className="checkout-field checkout-coupon">
              <span>Coupon code</span>
              <input
                name="coupon_code"
                value={formData.coupon_code}
                onChange={handleChange}
                placeholder="Optional"
              />
            </label>
          </section>

          <button
            type="submit"
            className="checkout-submit"
            disabled={submitting || syncing || loadingLocations}
          >
            <ShieldCheck size={18} />
            {submitting || syncing
              ? 'Preparing secure payment…'
              : `Continue to payment · ₦${estimatedTotal.toLocaleString()}`}
          </button>
        </form>

        <aside className="checkout-summary">
          <div className="checkout-summary-heading">
            <div>
              <p>Your order</p>
              <span>{cart.length} line items</span>
            </div>
            <PackageCheck size={20} />
          </div>
          <div className="checkout-items">
            {cart.map((item) => (
              <div key={`${item.product_id}-${item.variant_id || 'base'}`}>
                <img src={resolveImageUrl(item.image)} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <span>Qty {item.quantity}</span>
                </div>
                <strong>₦{Number(item.price * item.quantity).toLocaleString()}</strong>
              </div>
            ))}
          </div>
          <div className="checkout-totals">
            <p>
              <span>Subtotal</span>
              <strong>₦{subtotal.toLocaleString()}</strong>
            </p>
            <p>
              <span>{formData.delivery_method === 'pickup' ? 'Pickup' : 'Campus delivery'}</span>
              <strong>{deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : 'Free'}</strong>
            </p>
            <p className="checkout-total">
              <span>Estimated total</span>
              <strong>₦{estimatedTotal.toLocaleString()}</strong>
            </p>
          </div>
          {selectedLocation && (
            <div className="checkout-location-note">
              <MapPin size={16} />
              <span>
                <strong>{selectedLocation.name}</strong>
                {formData.delivery_method === 'pickup'
                  ? 'You will receive collection instructions after payment.'
                  : 'The vendor will use this point and your directions for delivery.'}
              </span>
            </div>
          )}
          <div className="checkout-protection">
            <ShieldCheck size={17} />
            <span>
              <strong>Protected checkout</strong>
              Payment is verified server-side before an order is marked paid.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
